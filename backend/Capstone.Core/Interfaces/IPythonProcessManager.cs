using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Capstone.Core.Interfaces
{
    /// <summary>
    /// Manages the Python worker process lifecycle and communication
    /// </summary>
    public interface IPythonProcessManager
    {
        /// <summary>
        /// Sends a command to the Python process and returns the response
        /// </summary>
        Task<string> SendCommandAsync(object command, CancellationToken ct = default);

        /// <summary>
        /// Initializes and starts the Python worker process
        /// </summary>
        Task InitializeAsync();

        /// <summary>
        /// Gracefully shuts down the Python worker process
        /// </summary>
        Task ShutdownAsync();
    }
}
