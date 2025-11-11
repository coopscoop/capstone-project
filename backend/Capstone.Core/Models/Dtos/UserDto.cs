namespace Capstone.Core.Models.DTOs;

public class UserDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }

    // unused as of now
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}