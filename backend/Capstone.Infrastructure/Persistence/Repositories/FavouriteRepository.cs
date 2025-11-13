namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Post repository implementation using Dapper
/// </summary>
public class FavouriteRepository : IFavouriteRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<PostRepository> _logger;

    public FavouriteRepository(
        DatabaseConnection dbConnection,
        ILogger<PostRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public Task<Favourite> CreateAsync(Favourite favourite)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int postId, int userId)
    {
        throw new NotImplementedException();
    }

    public Task<Favourite?> GetAsync(int postId, int userId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Favourite>> GetByPostIdAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Favourite>> GetByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<int> GetCountByPostIdAsync(int postId)
    {
        throw new NotImplementedException();
    }
}