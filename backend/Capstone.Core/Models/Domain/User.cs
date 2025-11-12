namespace Capstone.Core.Models.Domain;

/// <summary>
/// User domain model
/// </summary>
public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Hashed
    public bool IsAdmin { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public DateTime TimeCreated { get; set; }
    
    // Navigation properties (might be useful later? tbd)
    // public List<Post>? Posts { get; set; }
    // public List<Favourite>? Favourites { get; set; }
}