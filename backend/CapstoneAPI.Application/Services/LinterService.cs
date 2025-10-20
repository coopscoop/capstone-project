using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using CapstoneAPI.Core.Interfaces;
using CapstoneAPI.Core.Models;

namespace CapstoneAPI.Application.Services
{
    /// <summary>
    /// Handles code linting through the Python worker
    /// </summary>
    public class LinterService : ILinterService
    {
        private readonly IPythonProcessManager _pythonManager;
        private readonly ILogger<LinterService> _logger;

        public LinterService(
            IPythonProcessManager pythonManager,
            ILogger<LinterService> logger)
        {
            _pythonManager = pythonManager;
            _logger = logger;
        }

        public async Task<LintResult> LintCodeAsync(
            LintRequest request,
            CancellationToken ct = default)
        {
            try
            {
                _logger.LogDebug(
                    "Linting code (length: {Length}, rules: {Rules})",
                    request.Code.Length,
                    request.EnabledRules?.Count ?? 0);

                var command = new
                {
                    action = "lint",
                    code = request.Code,
                    enabled_rules = request.EnabledRules
                };

                var response = await _pythonManager.SendCommandAsync(command, ct);

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var lintResult = JsonSerializer.Deserialize<LintResult>(response, options);

                if (lintResult == null)
                {
                    _logger.LogWarning("Linter returned null result");
                    return new LintResult { IsValid = false };
                }

                _logger.LogInformation(
                    "Linting completed: Valid={Valid}, Issues={IssueCount}",
                    lintResult.IsValid,
                    lintResult.Issues.Count);

                return lintResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error linting code");
                return new LintResult
                {
                    IsValid = false,
                    Issues = new List<LintIssue>
                {
                    new LintIssue
                    {
                        Severity = "error",
                        Message = $"Linter error: {ex.Message}",
                        Line = 0,
                        Column = 0,
                        RuleId = "internal-error"
                    }
                }
                };
            }
        }
    }
}
