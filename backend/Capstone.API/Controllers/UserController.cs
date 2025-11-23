namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// API endpoints for user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserService userService,
        ILogger<UserController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users - Admin only
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        try
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all users");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        
        if (user == null)
            return NotFound(new { error = $"User with ID '{id}' not found" });

        return Ok(user);
    }

    /// <summary>
    /// Create new user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Email))
            return BadRequest(new { error = "Email is required" });

        if (string.IsNullOrWhiteSpace(createDto.Password))
            return BadRequest(new { error = "Password is required" });

        try
        {
            var user = await _userService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = user.UserId }, user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update user profile (display name and bio)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto request)
    {
        try
        {
            // TODO: Fix this, for some reason it's throwing unauthorized
            // Verify user is updating their own profile
            // var userIdClaim = User.FindFirst("userId")?.Value;
            // if (userIdClaim == null || !int.TryParse(userIdClaim, out var currentUserId))
            // {
            //     return Unauthorized();
            // }

            // if (currentUserId != id)
            // {
            //     return Forbid("You can only update your own profile");
            // }

            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var updated = await _userService.UpdateAsync(id, request);
            if (updated == null)
            {
                return BadRequest("Failed to update profile");
            }

            return Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, "An error occurred while updating profile");
        }
    }

    /// <summary>
    /// Delete user
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _userService.DeleteAsync(id);
        
        if (!deleted)
            return NotFound(new { error = $"User with ID '{id}' not found" });

        return NoContent();
    }

    /// <summary>
    /// Get user by email
    /// </summary>
    [HttpGet("email/{email}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetByEmail(string email)
    {
        var user = await _userService.GetByEmailAsync(email);
        
        if (user == null)
            return NotFound(new { error = $"User with email '{email}' not found" });

        return Ok(user);
    }
}