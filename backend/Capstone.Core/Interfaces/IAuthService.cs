using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest);
    Task<LoginResponseDto> RegisterAsync(RegisterRequestDto registerRequest);
    Task<UserDto?> GetCurrentUserAsync(int userId);
}