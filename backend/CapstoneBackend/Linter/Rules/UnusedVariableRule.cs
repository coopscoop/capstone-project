using System.Collections.Generic;

namespace CapstoneBackend.Linter.Rules;

public class UnusedVariableRule : ILinterRule
{
    public string RuleName => "UnusedVariable";
    public string Description => "Detects unused variables";

    public IEnumerable<LintIssue> Check(dynamic ast)
    {
        // Placeholder: In a real implementation, traverse the AST to find unused variables
        // Since AST is dynamic from IronPython, you'd need to access its properties
        // For example, ast.body is a list of statements
        // This would require recursive traversal

        // For now, return empty list
        return new List<LintIssue>();
    }
}
