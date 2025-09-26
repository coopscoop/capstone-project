using System.Collections.Generic;

namespace CapstoneLinter.Rules;

public class NoWildcardImportRule : ILintRule
{
    public IEnumerable<LinterResult> Analyze(AstInfo ast)
    {
        var results = new List<LinterResult>();

        foreach (var imp in ast.WildcardImports)
        {
            results.Add(new LinterResult
            {
                Message = $"Wildcard import from '{imp.Module}' is not allowed",
                Line = imp.Line,
                Column = 1
            });
        }

        return results;
    }
}
