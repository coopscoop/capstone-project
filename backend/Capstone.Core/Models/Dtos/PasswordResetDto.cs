namespace Capstone.Core.Models.Dtos;

public class PasswordResetDto
{
    public int UserId { get; set; }
    // Note: ResetCode is intentionally excluded for security
    public DateTime TimeCreated { get; set; }
}