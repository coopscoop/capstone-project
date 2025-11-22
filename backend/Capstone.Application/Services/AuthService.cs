namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Configuration;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenService jwtTokenService,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
        if (user == null)
        {
            _logger.LogWarning("Login attempt for non-existent user: {Email}", loginRequest.Email);
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password))
        {
            _logger.LogWarning("Invalid password attempt for user: {Email}", loginRequest.Email);
            return null;
        }

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token to database
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.UserId,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };
        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToDto(user)
        };
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto registerRequest)
    {
        var existingUser = await _userRepository.GetByEmailAsync(registerRequest.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        var user = new User
        {
            Email = registerRequest.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
            DisplayName = registerRequest.DisplayName,
            IsAdmin = false
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // Generate tokens
        var accessToken = _jwtTokenService.GenerateAccessToken(createdUser);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = createdUser.UserId,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };
        await _refreshTokenRepository.CreateAsync(refreshTokenEntity);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapToDto(createdUser)
        };
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        
        if (storedToken == null || !storedToken.IsActive)
        {
            _logger.LogWarning("Invalid or expired refresh token attempt");
            return null;
        }

        var user = await _userRepository.GetByIdAsync(storedToken.UserId);
        if (user == null)
        {
            return null;
        }

        // Generate new tokens
        var newAccessToken = _jwtTokenService.GenerateAccessToken(user);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        // Revoke old refresh token and save new one
        await _refreshTokenRepository.RevokeAsync(refreshToken, newRefreshToken);
        
        var newRefreshTokenEntity = new RefreshToken
        {
            UserId = user.UserId,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays)
        };
        await _refreshTokenRepository.CreateAsync(newRefreshTokenEntity);

        _logger.LogInformation("Refresh token rotated for user {UserId}", user.UserId);

        return new LoginResponseDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            User = MapToDto(user)
        };
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var storedToken = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (storedToken == null)
        {
            return false;
        }

        return await _refreshTokenRepository.RevokeAsync(refreshToken);
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user != null ? MapToDto(user) : null;
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            UserId = user.UserId,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            DisplayName = user.DisplayName,
            Bio = user.Bio,
            TimeCreated = user.TimeCreated
        };
    }
}