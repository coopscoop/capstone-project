using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Capstone.Core.Models;

namespace Capstone.Core.Interfaces
{
    /// <summary>
    /// Service for linting Python code
    /// </summary>
    public interface ILinterService
    {
        /// <summary>
        /// Lints Python code and returns any issues found
        /// </summary>
        Task<LintResult> LintCodeAsync(
            LintRequest request,
            CancellationToken ct = default);
    }
}
