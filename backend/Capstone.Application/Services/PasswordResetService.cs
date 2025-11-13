namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.DTOs;
using System.Threading.Tasks;
using Capstone.Core.Models.Dtos;

/// <summary>
/// Service for user-related business logic
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public PasswordResetService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task CleanupExpiredRequestsAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<PasswordResetDto> CreateResetRequestAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<PasswordResetDto?> GetByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ResetPasswordAsync(string resetCode, string newPassword)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> ValidateResetCodeAsync(string resetCode)
    {
        throw new NotImplementedException();
    }
}