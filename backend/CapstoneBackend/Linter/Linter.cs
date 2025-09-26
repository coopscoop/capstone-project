using System.Collections.Generic;
using System.Linq;
using IronPython.Hosting;
using Microsoft.Scripting.Hosting;

namespace CapstoneBackend.Linter;

public class PythonLinter
{
    private readonly ScriptEngine _engine;
    private readonly ScriptScope _scope;
    private readonly IEnumerable<ILinterRule> _rules;

    public PythonLinter(IEnumerable<ILinterRule> rules)
    {
        _rules = rules;
        _engine = Python.CreateEngine();
        _scope = _engine.CreateScope();
    }

    public IEnumerable<LintIssue> Lint(string pythonCode)
    {
        try
        {
            // Use compile to check for syntax errors
            _scope.SetVariable("code", pythonCode);
            _engine.Execute("compile(code, '<string>', 'exec')", _scope);

            // For now, return empty issues since rules are placeholder
            return new List<LintIssue>();
        }
        catch (Exception ex)
        {
            // If parsing fails, return a syntax error
            return new List<LintIssue>
            {
                new LintIssue
                {
                    RuleName = "SyntaxError",
                    Message = ex.Message,
                    Line = 1,
                    Column = 1,
                    Severity = "error"
                }
            };
        }
    }
}
