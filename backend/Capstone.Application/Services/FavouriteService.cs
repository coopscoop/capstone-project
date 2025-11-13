namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Service for managing favourite operations
/// </summary>
public class FavouriteService : IFavouriteService
{
    private readonly IFavouriteRepository _favouriteRepository;
    private readonly ILogger<FavouriteService> _logger;

    public FavouriteService(
        IFavouriteRepository favouriteRepository,
        ILogger<FavouriteService> logger)
    {
        _favouriteRepository = favouriteRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<FavouriteDto>> GetUserFavouritesAsync(int userId)
    {
        var favourites = await _favouriteRepository.GetByUserIdAsync(userId);
        return favourites.Select(MapToDto);
    }

    public async Task<IEnumerable<FavouriteDto>> GetPostFavouritesAsync(int postId)
    {
        var favourites = await _favouriteRepository.GetByPostIdAsync(postId);
        return favourites.Select(MapToDto);
    }

    public async Task<bool> IsFavouritedAsync(int postId, int userId)
    {
        var favourite = await _favouriteRepository.GetAsync(postId, userId);
        return favourite != null;
    }

    public async Task<FavouriteDto> AddFavouriteAsync(int postId, int userId)
    {
        var favourite = new Favourite
        {
            PostId = postId,
            UserId = userId
        };

        var created = await _favouriteRepository.CreateAsync(favourite);
        
        return new FavouriteDto
        {
            PostId = created.PostId,
            UserId = created.UserId
        };
    }

    public async Task<bool> RemoveFavouriteAsync(int postId, int userId)
    {
        return await _favouriteRepository.DeleteAsync(postId, userId);
    }

    public async Task<int> GetFavouriteCountAsync(int postId)
    {
        return await _favouriteRepository.GetCountByPostIdAsync(postId);
    }

    private static FavouriteDto MapToDto(Favourite favourite)
    {
        return new FavouriteDto
        {
            PostId = favourite.PostId,
            UserId = favourite.UserId
        };
    }
}