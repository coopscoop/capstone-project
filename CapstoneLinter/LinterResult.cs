namespace CapstoneLinter;

public class LinterResult
{
    public string Message { get; set; } = "";
    public int Line { get; set; }
    public int Column { get; set; }
}
