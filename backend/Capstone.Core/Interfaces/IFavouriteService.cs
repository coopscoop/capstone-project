using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface IFavouriteService
{
    Task<IEnumerable<FavouriteDto>> GetUserFavouritesAsync(int userId);
    Task<IEnumerable<FavouriteDto>> GetPostFavouritesAsync(int postId);
    Task<bool> IsFavouritedAsync(int postId, int userId);
    Task<FavouriteDto> AddFavouriteAsync(int postId, int userId);
    Task<bool> RemoveFavouriteAsync(int postId, int userId);
    Task<int> GetFavouriteCountAsync(int postId);
}