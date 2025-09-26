using Microsoft.AspNetCore.Mvc;
using CapstoneBackend.Linter;
using CapstoneBackend.Linter.Rules;

namespace CapstoneBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LintController : ControllerBase
{
    private readonly PythonLinter _linter;

    public LintController()
    {
        // For simplicity, instantiate rules here. In production, use DI.
        var rules = new List<ILinterRule>
        {
            new UnusedVariableRule()
        };
        _linter = new PythonLinter(rules);
    }

    [HttpPost]
    public IActionResult Lint([FromBody] LintRequest request)
    {
        if (string.IsNullOrEmpty(request.Code))
        {
            return BadRequest("Code is required");
        }

        var issues = _linter.Lint(request.Code);
        return Ok(new { Issues = issues });
    }
}

public class LintRequest
{
    public string Code { get; set; }
}
