namespace CapstoneLinter.Models;

public class LintIssue
{
    public string Message { get; set; }
    public int Line { get; set; }

    public LintIssue(string message, int line)
    {
        Message = message;
        Line = line;
    }

    public override string ToString() => $"Line {Line}: {Message}";
}
