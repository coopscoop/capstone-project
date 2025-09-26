using System.Collections.Generic;

namespace CapstoneBackend.Linter;

public interface ILinterRule
{
    string RuleName { get; }
    string Description { get; }
    IEnumerable<LintIssue> Check(dynamic ast);
}
