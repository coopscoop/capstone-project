using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int? ValidateAccessToken(string token);
}