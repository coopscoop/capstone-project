namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;
using Capstone.Core.Models.Domain;

/// <summary>
/// Controller for managing password reset operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PasswordResetController : ControllerBase
{
    private readonly IPasswordResetService _passwordResetService;
    private readonly ILogger<PasswordResetController> _logger;

    public PasswordResetController(
        IPasswordResetService passwordResetService,
        ILogger<PasswordResetController> logger)
    {
        _passwordResetService = passwordResetService;
        _logger = logger;
    }

    /// <summary>
    /// Get password reset request by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
    [Authorize] // Only authenticated users can check their own reset requests
    public async Task<ActionResult<PasswordResetDto>> GetByUserId(int userId)
    {
        try
        {
            var passwordReset = await _passwordResetService.GetByUserIdAsync(userId);
            if (passwordReset == null)
            {
                return NotFound("No password reset request found for this user");
            }
            return Ok(passwordReset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting password reset for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving password reset request");
        }
    }

    /// <summary>
    /// Validate a reset code
    /// </summary>
    [HttpGet("validate/{resetCode}")]
    [AllowAnonymous] // Anyone can validate a code
    public async Task<ActionResult<bool>> ValidateResetCode(string resetCode)
    {
        try
        {
            var isValid = await _passwordResetService.ValidateResetCodeAsync(resetCode);
            return Ok(isValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating reset code");
            return StatusCode(500, "An error occurred while validating reset code");
        }
    }

    /// <summary>
    /// Create a password reset request and send email with reset code
    /// </summary>
    [HttpPost("request/{userId}")]
    [AllowAnonymous] // Anyone can request a password reset
    public async Task<ActionResult<PasswordResetDto>> CreateResetRequest(int userId)
    {
        try
        {
            var passwordReset = await _passwordResetService.CreateResetRequestAsync(userId);
            return Ok(new 
            { 
                message = "Password reset code has been sent to your email",
                userId = passwordReset.UserId,
                timeCreated = passwordReset.TimeCreated
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid password reset request for user {UserId}", userId);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating password reset request for user {UserId}", userId);
            return StatusCode(500, "An error occurred while creating password reset request");
        }
    }

    /// <summary>
    /// Reset password using reset code
    /// </summary>
    [HttpPost("reset")]
    [AllowAnonymous] // Anyone can reset with valid code
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.ResetCode))
            {
                return BadRequest("Reset code is required");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest("New password is required");
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long");
            }

            var success = await _passwordResetService.ResetPasswordAsync(request.ResetCode, request.NewPassword);
            if (!success)
            {
                return BadRequest("Invalid or expired reset code");
            }
            
            return Ok(new { message = "Password successfully reset" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password");
            return StatusCode(500, "An error occurred while resetting password");
        }
    }

    /// <summary>
    /// Delete a password reset request
    /// </summary>
    [HttpDelete("{userId}")]
    [Authorize] // Only authenticated users can delete their own reset requests
    public async Task<ActionResult> Delete(int userId)
    {
        try
        {
            var success = await _passwordResetService.DeleteAsync(userId);
            if (!success)
            {
                return NotFound("Password reset request not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting password reset for user {UserId}", userId);
            return StatusCode(500, "An error occurred while deleting password reset request");
        }
    }

    /// <summary>
    /// Cleanup expired reset requests (typically called by a background job)
    /// </summary>
    [HttpPost("cleanup")]
    [Authorize(Roles = "Admin")] // Only admins can trigger cleanup
    public async Task<ActionResult> CleanupExpired()
    {
        try
        {
            await _passwordResetService.CleanupExpiredRequestsAsync();
            return Ok(new { message = "Expired reset requests cleaned up" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired password reset requests");
            return StatusCode(500, "An error occurred while cleaning up expired requests");
        }
    }
}