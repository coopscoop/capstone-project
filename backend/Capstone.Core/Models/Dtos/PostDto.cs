namespace Capstone.Core.Models.Dtos;

public class PostDto
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int NumberOfLikes { get; set; }
    public string FileLocation { get; set; } = string.Empty;
    public DateTime Created { get; set; }
    public DateTime LastEdited { get; set; }
    
    // Optional: Include user info
    public string? UserDisplayName { get; set; }
    
    // Optional: Include tags
    public List<string>? Tags { get; set; }
}