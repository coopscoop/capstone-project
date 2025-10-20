using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintIssue
    {
        public string Severity { get; set; } = "warning";
        public string Message { get; set; } = string.Empty;
        public int Line { get; set; }
        public int Column { get; set; }
        public int Row { get; set; }
        public string RuleId { get; set; } = string.Empty;
    }
}
