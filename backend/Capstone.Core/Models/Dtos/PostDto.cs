namespace Capstone.Core.Models.Dtos;

public class PostDto
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? NumberOfLikes { get; set; } = 0;
    public string Code { get; set; } = string.Empty;
    public bool IsVisible { get; set; } = true;
    public DateTime Created { get; set; }
    public DateTime LastEdited { get; set; }
    public List<string>? Tags { get; set; }
}