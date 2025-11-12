namespace Capstone.Core.Models.DTOs;

/// <summary>
/// User DTO for API responses (no password!)
/// </summary>
public class UserDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public DateTime TimeCreated { get; set; }
}