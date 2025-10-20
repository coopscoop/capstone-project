using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Models
{
    public class CodeExecutionRequest
    {
        public string Code { get; set; } = string.Empty;
        public bool RunLinter { get; set; } = true;
        public int TimeoutSeconds { get; set; } = 5;
    }
}
