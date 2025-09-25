using System;
using System.Collections.Generic;
using Python.Runtime;
using CapstoneLinter.Models;
using CapstoneLinter.Rules;

namespace CapstoneLinter
{
    public class Linter
    {
        private readonly List<RuleBase> _rules = new();

        public Linter()
        {
            foreach (var type in typeof(RuleBase).Assembly.GetTypes())
            {
                if (!type.IsAbstract && typeof(RuleBase).IsAssignableFrom(type))
                    _rules.Add((RuleBase)Activator.CreateInstance(type)!);
            }
        }

        public IEnumerable<LintIssue> Analyze(string code)
        {
            using (Py.GIL())
            {
                dynamic ast = Py.Import("ast");
                dynamic tree = ast.parse(code);

                var issues = new List<LintIssue>();
                foreach (var rule in _rules)
                    issues.AddRange(rule.Apply(tree));

                return issues;
            }
        }
    }
}
