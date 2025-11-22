namespace Capstone.Core.Models.Dtos;

public class LoginResponseDto
{
    public string RefreshToken { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}