namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.DTOs;

/// <summary>
/// Service for user-related business logic
/// </summary>
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<UserDto?> GetByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createDto)
    {
        // Check if email already exists
        if (await _userRepository.ExistsAsync(createDto.Email))
        {
            throw new InvalidOperationException($"User with email '{createDto.Email}' already exists");
        }

        // TODO: Hash password (for now, storing plain text - ADD HASHING LATER!)
        var user = new User
        {
            Email = createDto.Email,
            Password = createDto.Password, // TEMPORARY - hash this!
            DisplayName = createDto.DisplayName,
            IsAdmin = false
        };

        var created = await _userRepository.CreateAsync(user);
        _logger.LogInformation("Created user {UserId} with email {Email}", created.UserId, created.Email);

        return MapToDto(created);
    }

    public async Task<UserDto?> UpdateAsync(Guid userId, UpdateUserDto updateDto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        // Update only provided fields
        if (updateDto.DisplayName != null) user.DisplayName = updateDto.DisplayName;
        if (updateDto.Bio != null) user.Bio = updateDto.Bio;

        await _userRepository.UpdateAsync(user);
        _logger.LogInformation("Updated user {UserId}", userId);

        return MapToDto(user);
    }

    public async Task<bool> DeleteAsync(Guid userId)
    {
        var deleted = await _userRepository.DeleteAsync(userId);
        if (deleted)
        {
            _logger.LogInformation("Deleted user {UserId}", userId);
        }
        return deleted;
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
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }
}