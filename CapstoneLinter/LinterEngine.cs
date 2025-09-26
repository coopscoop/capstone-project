using Newtonsoft.Json;

namespace CapstoneLinter;

public class LinterEngine
{
    public IEnumerable<LinterResult> Analyze(string astJson, IEnumerable<ILintRule> rules)
    {
        // Deserialize AST from JSON
        var tree = JsonConvert.DeserializeObject<AstInfo>(astJson)!;

        List<LinterResult> results = new List<LinterResult>();
        foreach (var rule in rules)
        {
            results.AddRange(rule.Analyze(tree));
        }

        return results;
    }
}
