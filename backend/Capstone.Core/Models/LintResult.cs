using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class LintResult
    {
        /// <summary>
        /// Whether the code is valid or not, warnings are not considered invalid code
        /// </summary>
        [JsonPropertyName("isValid")]
        public bool IsValid { get; set; }

        /// <summary>
        /// The issues found in the code
        /// </summary>
        public List<LintIssue> Issues { get; set; } = new List<LintIssue>();
    }
}
