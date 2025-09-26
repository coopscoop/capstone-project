namespace CapstoneBackend.Models
{
    public class LinterResult
    {
        public string RuleName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int Line { get; set; }
    }
}
