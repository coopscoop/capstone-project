using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CapstoneAPI.Core.Interfaces;
using CapstoneAPI.Core.Models;
using System.Diagnostics;
using System.Text.Json;

namespace CapstoneAPI.Application.Services
{
    /// <summary>
    /// Orchestrates code execution with optional linting
    /// </summary>
    public class CodeExecutionService : ICodeExecutionService
    {
        private readonly IPythonProcessManager _pythonManager;
        private readonly ILinterService _linterService;
        private readonly ILogger<CodeExecutionService> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="pythonManager"></param>
        /// <param name="linterService"></param>
        /// <param name="logger"></param>
        public CodeExecutionService(
            IPythonProcessManager pythonManager,
            ILinterService linterService,
            ILogger<CodeExecutionService> logger)
        {
            _pythonManager = pythonManager;
            _linterService = linterService;
            _logger = logger;
        }

        /// <summary>
        /// Executes Python code with optional linting
        /// </summary>
        /// <param name="request"></param>
        /// <param name="ct"></param>
        /// <returns></returns>
        public async Task<CodeExecutionResult> ExecuteCodeAsync(
            CodeExecutionRequest request,
            CancellationToken ct = default)
        {
            var result = new CodeExecutionResult();
            var sw = Stopwatch.StartNew();

            try
            {
                _logger.LogInformation("Executing code (length: {Length})", request.Code.Length);

                // Run linter first if requested
                if (request.RunLinter)
                {
                    _logger.LogDebug("Running linter before execution");
                    var lintResult = await _linterService.LintCodeAsync(
                        new LintRequest { Code = request.Code }, ct);
                    result.LintIssues = lintResult.Issues;

                    // Log any critical errors
                    var errorCount = lintResult.Issues.Count(i => i.Severity == "error");
                    if (errorCount > 0)
                    {
                        _logger.LogWarning("Code has {ErrorCount} linting errors", errorCount);
                    }
                }

                // Execute code
                var command = new
                {
                    action = "execute",
                    code = request.Code,
                    timeout = request.TimeoutSeconds
                };

                var response = await _pythonManager.SendCommandAsync(command, ct);
                var executionResult = JsonSerializer.Deserialize<JsonElement>(response);

                result.Success = executionResult.GetProperty("success").GetBoolean();
                result.Output = executionResult.GetProperty("output").GetString() ?? "";
                result.Error = executionResult.GetProperty("error").GetString() ?? "";

                _logger.LogInformation(
                    "Code execution completed: Success={Success}, ExecutionTime={Time}ms",
                    result.Success,
                    sw.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing code");
                result.Success = false;
                result.Error = $"Execution failed: {ex.Message}";
            }
            finally
            {
                sw.Stop();
                result.ExecutionTimeMs = (int)sw.ElapsedMilliseconds;
            }

            return result;
        }
    }
}
