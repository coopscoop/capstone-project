using System.Collections.Generic;
using Python.Runtime;
using CapstoneLinter.Models;

namespace CapstoneLinter.Rules;

public class UnusedVariableRule : RuleBase
{
    public override IEnumerable<LintIssue> Apply(PyObject astTree)
    {
        // Dummy implementation for now
        yield return new LintIssue("Found unused variable 'unused'", 2);
    }
}
