using Microsoft.AspNetCore.Mvc;
using CapstoneAPI.Core.Interfaces;
using CapstoneAPI.Core.Models;

namespace CapstoneAPI.Controllers
{
    /// <summary>
    /// API endpoints for code execution and linting
    /// </summary>
    [ApiController]
    [Route("[controller]")]
    public class CodeController : ControllerBase
    {
        private readonly ICodeExecutionService _executionService;
        private readonly ILinterService _linterService;
        private readonly ILogger<CodeController> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="executionService"></param>
        /// <param name="linterService"></param>
        /// <param name="logger"></param>
        public CodeController(
            ICodeExecutionService executionService,
            ILinterService linterService,
            ILogger<CodeController> logger)
        {
            _executionService = executionService;
            _linterService = linterService;
            _logger = logger;
        }

        /// <summary>
        /// Executes Python code with optional linting
        /// </summary>
        /// <param name="request">Code execution parameters</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>Execution result with output and any lint issues</returns>
        [HttpPost("execute")]
        [ProducesResponseType(typeof(CodeExecutionResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CodeExecutionResult>> ExecuteCode(
            [FromBody] CodeExecutionRequest request,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { error = "Code cannot be empty" });
            }

            _logger.LogInformation("Received code execution request (length: {Length})",
                request.Code.Length);

            // Execute the code
            try
            {
                var result = await _executionService.ExecuteCodeAsync(request, ct);
                _logger.LogInformation("Code executed successfully");
                _logger.LogDebug($"Execution output: \n{result.Output}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute code");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Lints Python code without executing it
        /// </summary>
        /// <param name="request">Linting parameters</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>Linting results with any issues found</returns>
        [HttpPost("lint")]
        [ProducesResponseType(typeof(LintResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LintResult>> LintCode(
            [FromBody] LintRequest request,
            CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { error = "Code cannot be empty" });
            }

            _logger.LogInformation("Received lint request (length: {Length})",
                request.Code.Length);

            // Lint the code
            try
            {
                var result = await _linterService.LintCodeAsync(request, ct);
                _logger.LogInformation($"Code linted successfully with {result.Issues.Count} issues");
                _logger.LogInformation("Lint issues: {@Issues}", result.Issues);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to lint code");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
}
