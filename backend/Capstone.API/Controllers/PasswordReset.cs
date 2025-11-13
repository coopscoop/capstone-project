namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;

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
    /// Request model for password reset
    /// </summary>
    public class ResetPasswordRequest
    {
        public string ResetCode { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    /// <summary>
    /// Get password reset request by user ID
    /// </summary>
    [HttpGet("user/{userId}")]
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
    /// Create a password reset request
    /// </summary>
    [HttpPost("request/{userId}")]
    public async Task<ActionResult<PasswordResetDto>> CreateResetRequest(int userId)
    {
        try
        {
            var passwordReset = await _passwordResetService.CreateResetRequestAsync(userId);
            return CreatedAtAction(nameof(GetByUserId), new { userId }, passwordReset);
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
    public async Task<ActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            var success = await _passwordResetService.ResetPasswordAsync(request.ResetCode, request.NewPassword);
            if (!success)
            {
                return BadRequest("Invalid or expired reset code");
            }
            return Ok("Password successfully reset");
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
    public async Task<ActionResult> CleanupExpired()
    {
        try
        {
            await _passwordResetService.CleanupExpiredRequestsAsync();
            return Ok("Expired reset requests cleaned up");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up expired password reset requests");
            return StatusCode(500, "An error occurred while cleaning up expired requests");
        }
    }
}
