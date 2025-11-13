using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface IPasswordResetService
{
    Task<PasswordResetDto?> GetByUserIdAsync(int userId);
    Task<bool> ValidateResetCodeAsync(string resetCode);
    Task<PasswordResetDto> CreateResetRequestAsync(int userId);
    Task<bool> ResetPasswordAsync(string resetCode, string newPassword);
    Task<bool> DeleteAsync(int userId);
    Task CleanupExpiredRequestsAsync();
}