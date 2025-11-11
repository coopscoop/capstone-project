namespace Capstone.Core.Models.DTOs;

/// <summary>
/// Update user request
/// </summary>
public class UpdateUserDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public string? TextColour { get; set; }
    public string? BackgroundColour { get; set; }
    public string? FontSizeColour { get; set; }
    public string? KeywordsColour { get; set; }
    public string? ArgumentsColour { get; set; }
    public string? VariablesColour { get; set; }
}