namespace Capstone.Core.Models.Domain;

public class ResetPasswordRequest
{
    public string ResetCode { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}