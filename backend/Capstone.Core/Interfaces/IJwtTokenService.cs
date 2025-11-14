using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    int? ValidateToken(string token);
}