namespace Capstone.Core.Models.DTOs;

/// <summary>
/// Update user request
/// </summary>
public class UpdateUserDto
{
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
}