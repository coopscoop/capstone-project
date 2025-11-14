namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;

/// <summary>
/// Service for handling authentication operations
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto loginRequest)
    {
        // Get user by email
        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);
        if (user == null)
        {
            _logger.LogWarning("Login attempt for non-existent user: {Email}", loginRequest.Email);
            return null;
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password))
        {
            _logger.LogWarning("Invalid password attempt for user: {Email}", loginRequest.Email);
            return null;
        }

        // Generate JWT token
        var token = _jwtTokenService.GenerateToken(user);

        return new LoginResponseDto
        {
            Token = token,
            User = MapToDto(user)
        };
    }

    public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto registerRequest)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(registerRequest.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Create new user
        var user = new User
        {
            Email = registerRequest.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
            DisplayName = registerRequest.DisplayName,
            IsAdmin = false
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // Generate JWT token
        var token = _jwtTokenService.GenerateToken(createdUser);

        return new LoginResponseDto
        {
            Token = token,
            User = MapToDto(createdUser)
        };
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