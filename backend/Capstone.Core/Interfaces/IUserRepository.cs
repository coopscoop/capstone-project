namespace Capstone.Core.Interfaces;

using Capstone.Core.Models.Domain;

/// <summary>
/// Repository for User data access
/// </summary>
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(int userId);
    Task<bool> ExistsAsync(string email);
}