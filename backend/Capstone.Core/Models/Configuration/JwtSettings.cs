namespace Capstone.Core.Models.Configuration;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpirationInMinutes { get; set; } = 15; // 15 minutes for security
    public int RefreshTokenExpirationInDays { get; set; } = 7; // 7 days on extended login
}