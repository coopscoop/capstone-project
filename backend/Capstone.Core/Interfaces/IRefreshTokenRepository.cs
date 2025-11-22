using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    Task<bool> RevokeAsync(string token, string? replacedByToken = null);
    Task<bool> RevokeAllForUserAsync(int userId);
    Task<int> DeleteExpiredAsync();
}