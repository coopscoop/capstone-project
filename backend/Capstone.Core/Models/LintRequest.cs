using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintRequest
    {
        public string Code { get; set; } = string.Empty;
        public List<string?> EnabledRules { get; set; } = new List<string?>();
    }
}
