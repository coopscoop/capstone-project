using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneAPI.Core.Models
{
    internal class LintResult
    {
        public bool isValid { get; set; }
        public List<LintIssue> Issues { get; set; } = new List<LintIssue>();
    }
}
