using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneAPI.Core.Models
{
    /// <summary>
    /// Result of executing Python code
    /// </summary>
    public class CodeExecutionResult
    {
        /// <summary>
        /// True if code executed without errors
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Standard output from code execution
        /// </summary>
        public string Output { get; set; } = string.Empty;

        /// <summary>
        /// Error message or standard error output
        /// </summary>
        public string Error { get; set; } = string.Empty;

        /// <summary>
        /// Lint issues if RunLinter was true
        /// </summary>
        public List<LintIssue> LintIssues { get; set; } = new();

        /// <summary>
        /// Time taken to execute in milliseconds
        /// </summary>
        public int ExecutionTimeMs { get; set; }
    }
}
