using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging.Console;

namespace Capstone.API.Logging;

public sealed class CustomConsoleFormatter : ConsoleFormatter
{
    public CustomConsoleFormatter() : base("custom") { }

    public override void Write<TState>(in LogEntry<TState> logEntry, IExternalScopeProvider? scopeProvider, TextWriter textWriter)
    {
        var logLevel = logEntry.LogLevel;
        var message = logEntry.Formatter(logEntry.State, logEntry.Exception);

        // Set colors and prefixes based on log level
        var (color, prefix) = logLevel switch
        {
            LogLevel.Trace => (ConsoleColor.Gray, "TRACE: "),
            LogLevel.Debug => (ConsoleColor.Blue, "DEBUG: "),
            LogLevel.Information => (ConsoleColor.Green, "INFO: "),
            LogLevel.Warning => (ConsoleColor.Yellow, "WARN: "),
            LogLevel.Error => (ConsoleColor.Red, "ERROR: "),
            LogLevel.Critical => (ConsoleColor.DarkRed, "CRITICAL: "),
            _ => (ConsoleColor.White, $"{logLevel}: ")
        };

        // use the coloured prefix
        var originalColor = Console.ForegroundColor;
        Console.ForegroundColor = color;
        Console.Write(prefix);
        
        // back to white
        Console.ForegroundColor = originalColor;
        Console.WriteLine(message);
        
        // if there's an exception, write it in red
        if (logEntry.Exception != null)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write("EXCEPTION: ");
            Console.ForegroundColor = originalColor;
            Console.WriteLine(logEntry.Exception);
        }
    }
}