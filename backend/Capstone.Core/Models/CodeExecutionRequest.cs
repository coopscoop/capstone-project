using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class CodeExecutionRequest
    {
        /// <summary>
        /// The Python code to execute
        /// </summary>
        public string Code { get; set; } = string.Empty;

        /// <summary>
        /// Whether to run the linter before execution
        /// </summary>
        public bool RunLinter { get; set; } = true;

        /// <summary>
        /// Timeout for code execution in seconds, default is 5 seconds and its enough to run 90% of the code snippets. Can be changed based on user needs.
        /// </summary>
        public int TimeoutSeconds { get; set; } = 5;
    }
}
