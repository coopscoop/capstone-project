using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO.Enumeration;
using Capstone.Core.Interfaces;

namespace Capstone.Infrastructure
{
    /// <summary>
    /// Manages a long-running Python worker process for code execution and linting.
    /// Uses stdin/stdout with JSON-lines protocol for communication.
    /// </summary>
    public class PythonProcessManager : IPythonProcessManager, IDisposable
    {
        private Process? _pythonProcess;
        private readonly SemaphoreSlim _lock = new(1, 1);
        private readonly ILogger<PythonProcessManager> _logger;
        private readonly string _pythonScriptPath;
        private bool _isInitialized;

        public PythonProcessManager(
            ILogger<PythonProcessManager> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            _pythonScriptPath = configuration["Python:ScriptPath"]
                ?? throw new InvalidOperationException("Python:ScriptPath not configured in appsettings.json");

            // Make path absolute if relative
            if (!Path.IsPathRooted(_pythonScriptPath))
            {
                _pythonScriptPath = Path.GetFullPath(_pythonScriptPath);
                _logger.LogInformation($"Converted Python script path to absolute: {_pythonScriptPath}");
            }

            _logger.LogInformation("Python script path: {Path}", _pythonScriptPath);
        }

        /// <summary>
        /// Starts the Python worker process if not already running
        /// </summary>
        public async Task InitializeAsync()
        {
            if (_isInitialized)
                return;

            await _lock.WaitAsync();
            try
            {
                // Double-check pattern
                if (_isInitialized)
                    return;

                if (_pythonProcess != null && !_pythonProcess.HasExited)
                {
                    _logger.LogInformation("Python process already running");
                    _isInitialized = true;
                    return;
                }

                _logger.LogInformation("Starting Python worker process...");

                if (!File.Exists(_pythonScriptPath))
                {
                    throw new FileNotFoundException(
                        $"Python script not found at: {_pythonScriptPath}");
                }

                // handle cross-platform python command - windows using python, others using python3
                string _FileName;
                if (OperatingSystem.IsWindows())
                {
                    _FileName = "python";
                }
                else
                {
                    _FileName = "python3";
                }

                var startInfo = new ProcessStartInfo
                {
                    FileName = _FileName,
                    Arguments = _pythonScriptPath,
                    UseShellExecute = false,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WorkingDirectory = Path.GetDirectoryName(_pythonScriptPath)
                };

                _pythonProcess = Process.Start(startInfo);

                if (_pythonProcess == null)
                {
                    throw new InvalidOperationException("Failed to start Python process");
                }

                // Wait for ready signal
                var readyLine = await _pythonProcess.StandardOutput.ReadLineAsync();

                if (string.IsNullOrEmpty(readyLine))
                {
                    throw new InvalidOperationException("Python process did not send ready signal");
                }

                _logger.LogInformation(
                    "Python process started successfully (PID: {ProcessId})",
                    _pythonProcess.Id);

                // Start error output monitoring
                _ = Task.Run(() => MonitorErrorOutput());

                _isInitialized = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Python process");
                throw;
            }
            finally
            {
                _lock.Release();
            }
        }

        /// <summary>
        /// Sends a command to Python and waits for the response
        /// </summary>
        public async Task<string> SendCommandAsync(object command, CancellationToken ct = default)
        {
            if (!_isInitialized || _pythonProcess == null || _pythonProcess.HasExited)
            {
                await InitializeAsync();
            }

            await _lock.WaitAsync(ct);
            try
            {
                if (_pythonProcess == null || _pythonProcess.HasExited)
                {
                    throw new InvalidOperationException("Python process is not running");
                }

                var json = JsonSerializer.Serialize(command);

                _logger.LogDebug("Sending command to Python: {Command}",
                    json.Length > 100 ? json[..100] + "..." : json);

                // Send command
                await _pythonProcess.StandardInput.WriteLineAsync(json);
                await _pythonProcess.StandardInput.FlushAsync();

                // Read response
                var response = await _pythonProcess.StandardOutput.ReadLineAsync();

                if (string.IsNullOrEmpty(response))
                {
                    throw new InvalidOperationException(
                        "Python process returned empty response. Process may have crashed.");
                }

                _logger.LogDebug("Received response from Python (length: {Length})", response.Length);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error communicating with Python process");

                // Try to restart the process
                _isInitialized = false;
                throw;
            }
            finally
            {
                _lock.Release();
            }
        }

        /// <summary>
        /// Gracefully shuts down the Python process
        /// </summary>
        public async Task ShutdownAsync()
        {
            await _lock.WaitAsync();
            try
            {
                if (_pythonProcess != null && !_pythonProcess.HasExited)
                {
                    _logger.LogInformation("Shutting down Python process (PID: {ProcessId})",
                        _pythonProcess.Id);

                    // Close stdin to signal shutdown
                    _pythonProcess.StandardInput.Close();

                    // Wait for graceful exit
                    var exited = _pythonProcess.WaitForExit(5000);

                    if (!exited)
                    {
                        _logger.LogWarning("Python process did not exit gracefully, forcing termination");
                        _pythonProcess.Kill();
                        await _pythonProcess.WaitForExitAsync();
                    }

                    _logger.LogInformation("Python process terminated");
                }

                _isInitialized = false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error shutting down Python process");
            }
            finally
            {
                _lock.Release();
            }
        }

        /// <summary>
        /// Monitors Python's stderr for errors
        /// </summary>
        private async Task MonitorErrorOutput()
        {
            try
            {
                if (_pythonProcess == null)
                    return;

                while (!_pythonProcess.HasExited)
                {
                    var errorLine = await _pythonProcess.StandardError.ReadLineAsync();
                    if (!string.IsNullOrEmpty(errorLine))
                    {
                        _logger.LogWarning("Python stderr: {Error}", errorLine);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error monitoring Python stderr");
            }
        }

        public void Dispose()
        {
            _pythonProcess?.Dispose();
            _lock.Dispose();
            GC.SuppressFinalize(this);
        }
    }
}
