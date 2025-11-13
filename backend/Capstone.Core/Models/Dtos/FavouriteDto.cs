namespace Capstone.Core.Models.Dtos;

public class FavouriteDto
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    // Optionally include related data
    public string? PostTitle { get; set; }
    public string? UserDisplayName { get; set; }
}