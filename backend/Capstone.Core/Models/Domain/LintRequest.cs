using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintRequest
    {
        /// <summary>
        /// Code to be linted
        /// </summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// List of enabled linting rules
        /// </summary>
        public List<string?> EnabledRules { get; set; } = new List<string?>();
    }
}
