using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CapstoneAPI.Core.Models;

namespace CapstoneAPI.Core.Interfaces
{
    /// <summary>
    /// Interface for code execution service
    /// </summary>
    public interface ICodeExecutionService
    {
        /// <summary>
        /// Executes Python code and returns the result
        /// </summary>
        Task<CodeExecutionResult> ExecuteCodeAsync(
            CodeExecutionRequest request,
            CancellationToken ct = default);
    }
}
