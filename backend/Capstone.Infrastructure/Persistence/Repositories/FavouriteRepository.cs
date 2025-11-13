namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Favourite repository implementation using Dapper
/// </summary>
public class FavouriteRepository : IFavouriteRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<FavouriteRepository> _logger;

    public FavouriteRepository(
        DatabaseConnection dbConnection,
        ILogger<FavouriteRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<IEnumerable<Favourite>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId
            FROM favourites
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Favourite>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Favourite>> GetByPostIdAsync(int postId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId
            FROM favourites
            WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Favourite>(sql, new { PostId = postId });
    }

    public async Task<Favourite?> GetAsync(int postId, int userId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId
            FROM favourites
            WHERE post_id = @PostId AND user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Favourite>(sql, new { PostId = postId, UserId = userId });
    }

    public async Task<Favourite> CreateAsync(Favourite favourite)
    {
        const string sql = @"
            INSERT INTO favourites (post_id, user_id)
            VALUES (@PostId, @UserId)
            RETURNING 
                post_id AS PostId,
                user_id AS UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<Favourite>(sql, favourite);
    }

    public async Task<bool> DeleteAsync(int postId, int userId)
    {
        const string sql = "DELETE FROM favourites WHERE post_id = @PostId AND user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId, UserId = userId });
        return affected > 0;
    }

    public async Task<int> GetCountByPostIdAsync(int postId)
    {
        const string sql = "SELECT COUNT(*) FROM favourites WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, new { PostId = postId });
    }
}