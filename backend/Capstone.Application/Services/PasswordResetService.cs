namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;
using System.Security.Cryptography;

/// <summary>
/// Service for managing password reset operations
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly IPasswordResetRepository _passwordResetRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService; // Add this
    private readonly ILogger<PasswordResetService> _logger;
    private const int ResetCodeExpirationHours = 24;

    public PasswordResetService(
        IPasswordResetRepository passwordResetRepository,
        IUserRepository userRepository,
        IEmailService emailService, // Add this
        ILogger<PasswordResetService> logger)
    {
        _passwordResetRepository = passwordResetRepository;
        _userRepository = userRepository;
        _emailService = emailService; // Add this
        _logger = logger;
    }

    public async Task<PasswordResetDto?> GetByUserIdAsync(int userId)
    {
        var passwordReset = await _passwordResetRepository.GetByUserIdAsync(userId);
        return passwordReset != null ? MapToDto(passwordReset) : null;
    }

    public async Task<bool> ValidateResetCodeAsync(string resetCode)
    {
        var passwordReset = await _passwordResetRepository.GetByResetCodeAsync(resetCode);
        
        if (passwordReset == null)
        {
            return false;
        }

        // Check if the reset code has expired
        var expirationTime = passwordReset.TimeCreated.AddHours(ResetCodeExpirationHours);
        if (DateTime.UtcNow > expirationTime)
        {
            await _passwordResetRepository.DeleteAsync(passwordReset.UserId);
            return false;
        }

        return true;
    }

    public async Task<PasswordResetDto> CreateResetRequestAsync(int userId)
    {
        // Get the user to send email
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        // Delete any existing reset requests for this user
        await _passwordResetRepository.DeleteAsync(userId);

        // Generate a secure random reset code
        var resetCode = GenerateResetCode();

        var passwordReset = new PasswordReset
        {
            UserId = userId,
            ResetCode = resetCode
        };

        var created = await _passwordResetRepository.CreateAsync(passwordReset);

        // Send email with reset code
        try
        {
            var resetUrl = "http://localhost:3000/reset-password";
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetCode, resetUrl);
            _logger.LogInformation("Password reset email sent to user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset email to user {UserId}", userId);
        }

        return MapToDto(created);
    }

    public async Task<bool> ResetPasswordAsync(string resetCode, string newPassword)
    {
        // Validate the reset code
        if (!await ValidateResetCodeAsync(resetCode))
        {
            return false;
        }

        var passwordReset = await _passwordResetRepository.GetByResetCodeAsync(resetCode);
        if (passwordReset == null)
        {
            return false;
        }

        // Get the user and update their password
        var user = await _userRepository.GetByIdAsync(passwordReset.UserId);
        if (user == null)
        {
            return false;
        }

        // Hash the new password
        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        
        var updateSuccess = await _userRepository.UpdateAsync(user);
        if (!updateSuccess)
        {
            return false;
        }

        // Delete the reset request after successful password change
        await _passwordResetRepository.DeleteAsync(passwordReset.UserId);
        
        _logger.LogInformation("Password successfully reset for user {UserId}", passwordReset.UserId);
        
        return true;
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        return await _passwordResetRepository.DeleteAsync(userId);
    }

    public async Task CleanupExpiredRequestsAsync()
    {
        var expirationTime = DateTime.UtcNow.AddHours(-ResetCodeExpirationHours);
        await _passwordResetRepository.DeleteExpiredAsync();
    }

    private static PasswordResetDto MapToDto(PasswordReset passwordReset)
    {
        return new PasswordResetDto
        {
            UserId = passwordReset.UserId,
            TimeCreated = passwordReset.TimeCreated
        };
    }

    private static string GenerateResetCode()
    {
        // Generate a random code, 32 characters long should be enough
        var bytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(bytes);
        }

        // get rid of +, / and = characters for url safety - changed how I pass the code to the frontend but its still not a bad idea to leave
        return Convert.ToBase64String(bytes).Replace("+", "").Replace("/", "").Replace("=", "")[..32];
    }
}