using System.Collections.Generic;
using Python.Runtime;
using CapstoneLinter.Models;

namespace CapstoneLinter.Rules;

public class ImproperIndentRule : RuleBase
{
    public override IEnumerable<LintIssue> Apply(PyObject astTree)
    {
        // Dummy implementation for now
        yield return new LintIssue("Improper indentation detected", 4);
    }
}
