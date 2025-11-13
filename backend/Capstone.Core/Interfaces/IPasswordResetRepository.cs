using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IPasswordResetRepository
{
    Task<PasswordReset?> GetByUserIdAsync(int userId);
    Task<PasswordReset?> GetByResetCodeAsync(string resetCode);
    Task<PasswordReset> CreateAsync(PasswordReset passwordReset);
    Task<bool> DeleteAsync(int userId);
    Task<bool> DeleteExpiredAsync(DateTime expirationTime);
}