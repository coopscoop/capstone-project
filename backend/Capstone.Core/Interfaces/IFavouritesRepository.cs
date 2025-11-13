using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IFavouriteRepository
{
    Task<IEnumerable<Favourite>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Favourite>> GetByPostIdAsync(int postId);
    Task<Favourite?> GetAsync(int postId, int userId);
    Task<Favourite> CreateAsync(Favourite favourite);
    Task<bool> DeleteAsync(int postId, int userId);
    Task<int> GetCountByPostIdAsync(int postId);
}