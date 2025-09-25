using System.Collections.Generic;
using Python.Runtime;
using CapstoneLinter.Models;

namespace CapstoneLinter.Rules;

public abstract class RuleBase
{
    public abstract IEnumerable<LintIssue> Apply(PyObject astTree);
}
