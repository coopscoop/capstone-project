namespace CapstoneBackend.Linter;

public class LintIssue
{
    public string RuleName { get; set; }
    public string Message { get; set; }
    public int Line { get; set; }
    public int Column { get; set; }
    public string Severity { get; set; } // e.g., "error", "warning"
}
