namespace Capstone.Core.Interfaces;

public interface IUserContextService
{
    int? UserId { get; }
    bool IsAdmin { get; }
    bool IsAuthenticated { get; }
}