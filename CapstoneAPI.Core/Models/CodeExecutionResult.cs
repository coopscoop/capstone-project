using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneAPI.Core.Models
{
    internal class CodeExecutionResult
    {
        public string Output { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public List<LintIssue> LintIssues = new List<LintIssue>();
        public int ExecutionTimeMs { get; set; }
    }
}
