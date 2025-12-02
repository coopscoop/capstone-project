namespace Capstone.Core.Models.Dtos;

public class PostDto
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? NumberOfLikes { get; set; }
    public string Code { get; set; } = string.Empty;
    public bool IsVisible { get; set; } = true;
    public string? DisplayName { get; set; }
    public DateTime Created { get; set; }
    public DateTime LastEdited { get; set; }
    public List<string>? Tags { get; set; }
}