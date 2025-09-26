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
        var paths = _engine.GetSearchPaths();
        var assemblyLocation = System.IO.Path.GetDirectoryName(typeof(PythonLinter).Assembly.Location);
        var libPath = System.IO.Path.Combine(assemblyLocation, "..", "..", "..", "..", "lib");
        paths.Add(libPath);
        _engine.SetSearchPaths(paths);
        _scope = _engine.CreateScope();
        _engine.Execute("import clr", _scope);
        _engine.Execute("clr.AddReference('IronPython.Modules')", _scope);
        _engine.Execute("from IronPython.Modules import ast", _scope);
    }

    public IEnumerable<LintIssue> Lint(string pythonCode)
    {
        try
        {
            // Parse the code into AST using IronPython
            _scope.SetVariable("code", pythonCode);
            var ast = _engine.Execute("ast.parse(code)", _scope);

            // Apply all rules
            var issues = new List<LintIssue>();
            foreach (var rule in _rules)
            {
                issues.AddRange(rule.Check(ast));
            }
            return issues;
        }
        catch
        {
            // If parsing fails, return a syntax error
            return new List<LintIssue>
            {
                new LintIssue
                {
                    RuleName = "SyntaxError",
                    Message = "Failed to parse Python code",
                    Line = 1,
                    Column = 1,
                    Severity = "error"
                }
            };
        }
    }
}
