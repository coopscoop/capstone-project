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

    public async Task<User?> GetByIdAsync(Guid userId)
    {
        const string sql = @"
            SELECT user_id AS UserId, 
                   email AS Email, 
                   password AS Password,
                   is_admin AS IsAdmin,
                   display_name AS DisplayName,
                   bio AS Bio,
                   created_at AS CreatedAt,
                   last_login_at AS LastLoginAt
            FROM users 
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { UserId = userId });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"
            SELECT user_id AS UserId, 
                   email AS Email, 
                   password AS Password,
                   is_admin AS IsAdmin,
                   display_name AS DisplayName,
                   bio AS Bio,
                   created_at AS CreatedAt,
                   last_login_at AS LastLoginAt
            FROM users 
            WHERE email = @Email";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string sql = @"
            SELECT user_id AS UserId, 
                   email AS Email, 
                   password AS Password,
                   is_admin AS IsAdmin,
                   display_name AS DisplayName,
                   bio AS Bio,
                   created_at AS CreatedAt,
                   last_login_at AS LastLoginAt
            FROM users 
            ORDER BY created_at DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<User>(sql);
    }

    public async Task<User> CreateAsync(User user)
    {
        const string sql = @"
            INSERT INTO users (
                user_id, email, password, is_admin, display_name, 
                bio, created_at
            )
            VALUES (
                @UserId, @Email, @Password, @IsAdmin, @DisplayName,
                @Bio, @CreatedAt
            )
            RETURNING user_id AS UserId, 
                      email AS Email, 
                      password AS Password,
                      is_admin AS IsAdmin,
                      display_name AS DisplayName,
                      bio AS Bio,
                      created_at AS CreatedAt,
                      last_login_at AS LastLoginAt";

        user.UserId = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<User>(sql, user);
    }

    public async Task<bool> UpdateAsync(User user)
    {
        const string sql = @"
            UPDATE users 
            SET display_name = @DisplayName,
                bio = @Bio,
                last_login_at = @LastLoginAt
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, user);
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(Guid userId)
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