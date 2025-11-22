using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int? ValidateToken(string token);
}