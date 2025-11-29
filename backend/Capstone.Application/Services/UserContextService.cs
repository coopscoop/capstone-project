
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Capstone.Application.Services;
public class UserContextService : IUserContextService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<UserContextService> _logger;

    public UserContextService(IHttpContextAccessor httpContextAccessor, ILogger<UserContextService> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public int? UserId => GetUserId();
    public bool IsAdmin => GetIsAdmin();
    public bool IsAuthenticated => UserId.HasValue && UserId > 0;

    private int? GetUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null) return null;

        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? user.FindFirst("sub")?.Value
                       ?? user.FindFirst("userId")?.Value
                       ?? user.FindFirst("id")?.Value;

        if (int.TryParse(userIdClaim, out int userId))
            return userId;

        return null;
    }

    private bool GetIsAdmin()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null) return false;

        var isAdminClaim = user.FindFirst("isAdmin")?.Value
                        ?? user.FindFirst("IsAdmin")?.Value
                        ?? user.FindFirst("admin")?.Value
                        ?? user.FindFirst(ClaimTypes.Role)?.Value;

        if (bool.TryParse(isAdminClaim, out bool isAdmin))
            return isAdmin;

        return !string.IsNullOrEmpty(isAdminClaim) && (
            isAdminClaim.Equals("admin", StringComparison.OrdinalIgnoreCase) ||
            isAdminClaim.Equals("true", StringComparison.OrdinalIgnoreCase) ||
            isAdminClaim.Equals("1", StringComparison.OrdinalIgnoreCase));
    }
}