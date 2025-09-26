using System.Collections.Generic;

namespace CapstoneLinter.Rules;

public class FunctionNameRule : ILintRule
{
    public IEnumerable<LinterResult> Analyze(AstInfo ast)
    {
        var results = new List<LinterResult>();

        foreach (var func in ast.Functions)
        {
            if (!char.IsLower(func.Name[0]))
            {
                results.Add(new LinterResult
                {
                    Message = $"Function '{func.Name}' should start with a lowercase letter",
                    Line = func.Line,
                    Column = 1
                });
            }
        }

        return results;
    }
}
