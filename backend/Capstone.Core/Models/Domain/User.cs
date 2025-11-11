namespace Capstone.Core.Models.Domain;

/// <summary>
/// User domain model
/// </summary>
public class User
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Will be hashed
    public bool IsAdmin { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }

    // these are not used as of now? should add them to db later
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}