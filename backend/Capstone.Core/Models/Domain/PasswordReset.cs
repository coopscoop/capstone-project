namespace Capstone.Core.Models.Domain;

public class PasswordReset
{
    public int UserId { get; set; }
    public string ResetCode { get; set; } = string.Empty;
    public DateTime TimeCreated { get; set; }
}