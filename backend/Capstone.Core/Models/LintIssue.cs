using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintIssue
    {
        /// <summary>
        /// Severity of the issue: "error", "warning", "info"
        /// </summary>
        public string Severity { get; set; } = "warning";

        /// <summary>
        /// Message describing the lint issue
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Line number where the issue occurs
        /// </summary>
        public int Line { get; set; }

        /// <summary>
        /// Column number where the issue occurs
        /// </summary>
        public int Column { get; set; }

        /// <summary>
        /// Identifier for the linting rule violated
        /// </summary>
        public string RuleId { get; set; } = string.Empty;
    }
}
