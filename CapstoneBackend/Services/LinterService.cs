using CapstoneBackend.Models;

namespace CapstoneBackend.Services
{
    public class LinterService
    {
        // Minimal dummy linter rule
        public List<LinterResult> Lint(string code)
        {
            var results = new List<LinterResult>();

            // Example: always flag functions not lowercase
            var lines = code.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                if (lines[i].StartsWith("def "))
                {
                    var fnName = lines[i].Split(' ')[1].Split('(')[0];
                    if (fnName != fnName.ToLower())
                    {
                        results.Add(new LinterResult
                        {
                            RuleName = "FunctionNameRule",
                            Message = $"Function '{fnName}' should be lowercase",
                            Line = i + 1
                        });
                    }
                }
            }

            // Example: flag wildcard imports
            if (code.Contains("from") && code.Contains("import *"))
            {
                results.Add(new LinterResult
                {
                    RuleName = "NoWildcardImportRule",
                    Message = "Wildcard imports are not allowed",
                    Line = 0
                });
            }

            return results;
        }
    }
}
