namespace Capstone.Core.Models.DTOs;

/// <summary>
/// Create user request
/// </summary>
public class CreateUserDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
}