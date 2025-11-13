namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.DTOs;
using System.Threading.Tasks;
using Capstone.Core.Models.Dtos;
using System.Collections.Generic;

/// <summary>
/// Service for user-related business logic
/// </summary>
public class FavouriteService : IFavouriteService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public FavouriteService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<FavouriteDto> AddFavouriteAsync(int postId, int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<int> GetFavouriteCountAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<FavouriteDto>> GetPostFavouritesAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<FavouriteDto>> GetUserFavouritesAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> IsFavouritedAsync(int postId, int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> RemoveFavouriteAsync(int postId, int userId)
    {
        throw new NotImplementedException();
    }
}