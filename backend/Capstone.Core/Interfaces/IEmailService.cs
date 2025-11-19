namespace Capstone.Core.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetCode, string resetUrl);
    Task SendWelcomeEmailAsync(string toEmail, string displayName);
}