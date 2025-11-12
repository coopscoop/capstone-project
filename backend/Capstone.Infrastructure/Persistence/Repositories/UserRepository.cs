namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;

/// <summary>
/// User repository implementation using Dapper
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(
        DatabaseConnection dbConnection,
        ILogger<UserRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<User?> GetByIdAsync(int userId)
    {
        const string sql = @"
            SELECT 
                user_id AS UserId,
                email AS Email,
                password AS Password,
                is_admin AS IsAdmin,
                display_name AS DisplayName,
                bio AS Bio,
                time_created AS TimeCreated
            FROM users 
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { UserId = userId });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"
            SELECT 
                user_id AS UserId,
                email AS Email,
                password AS Password,
                is_admin AS IsAdmin,
                display_name AS DisplayName,
                bio AS Bio,
                time_created AS TimeCreated
            FROM users 
            WHERE email = @Email";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string sql = @"
            SELECT 
                user_id AS UserId,
                email AS Email,
                password AS Password,
                is_admin AS IsAdmin,
                display_name AS DisplayName,
                bio AS Bio,
                time_created AS TimeCreated
            FROM users 
            ORDER BY time_created DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<User>(sql);
    }

    public async Task<User> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (
                email,
                password,
                is_admin,
                display_name,
                bio,
                time_created
            )
            VALUES (
                @Email,
                @Password,
                @IsAdmin,
                @DisplayName,
                @Bio,
                @TimeCreated
            )
            RETURNING 
                user_id AS UserId,
                email AS Email,
                password AS Password,
                is_admin AS IsAdmin,
                display_name AS DisplayName,
                bio AS Bio,
                time_created AS TimeCreated";

        user.TimeCreated = DateTime.UtcNow;
        user.IsAdmin = false; // Default to non-admin

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<User>(sql, user);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        const string sql = @"
            UPDATE users 
            SET 
                display_name = @DisplayName,
                bio = @Bio
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, user);
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        const string sql = "DELETE FROM users WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return affected > 0;
    }

    public async Task<bool> ExistsAsync(string email)
    {
        const string sql = "SELECT COUNT(1) FROM users WHERE email = @Email";

        await using var connection = _dbConnection.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email });
        return count > 0;
    }
}