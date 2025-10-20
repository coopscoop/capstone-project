using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintResult
    {
        public bool IsValid { get; set; }
        public List<LintIssue> Issues { get; set; } = new List<LintIssue>();
    }
}
