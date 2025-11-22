using Capstone.Core.Models.Dtos;
using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    Task<LoginResponseDto> RegisterAsync(RegisterRequestDto registerRequest);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
    Task<bool> RevokeTokenAsync(string refreshToken);
}