using System;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Configuration;

namespace Capstone.Application.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IOptions<EmailSettings> emailSettings,
        ILogger<EmailService> logger)
    {
        _emailSettings = emailSettings.Value;
        _logger = logger;

        // DEBUG: Log the settings
        _logger.LogInformation("Email Settings - Host: {Host}, Port: {Port}, Username: {Username}", 
            _emailSettings.SmtpHost, 
            _emailSettings.SmtpPort, 
            _emailSettings.SmtpUsername);
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string resetCode, string resetUrl)
    {
        var subject = "Password Reset Request";
        var body = $@"
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Use the following code to reset it:</p>
            <p><strong style='font-size: 18px; letter-spacing: 2px;'>{resetCode}</strong></p>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string displayName)
    {
        var subject = "Welcome to Capstone Project!";
        var body = $@"
            <h2>Welcome {displayName}!</h2>
            <p>Thank you for registering with Capstone Project.</p>
            <p>You can now start creating and sharing your Python projects.</p>
        ";

        await SendEmailAsync(toEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_emailSettings.SmtpHost, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_emailSettings.SmtpUsername, _emailSettings.SmtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            throw;
        }
    }
}