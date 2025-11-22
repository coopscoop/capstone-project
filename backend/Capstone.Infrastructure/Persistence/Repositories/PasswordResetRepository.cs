namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;

/// <summary>
/// Password reset repository implementation using Dapper
/// </summary>
public class PasswordResetRepository : IPasswordResetRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<PasswordResetRepository> _logger;

    public PasswordResetRepository(
        DatabaseConnection dbConnection,
        ILogger<PasswordResetRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<PasswordReset?> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT 
                user_id AS UserId,
                reset_code AS ResetCode,
                time_created AS TimeCreated
            FROM password_reset
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<PasswordReset>(sql, new { UserId = userId });
    }

    public async Task<PasswordReset?> GetByResetCodeAsync(string resetCode)
    {
        const string sql = @"
            SELECT 
                user_id AS UserId,
                reset_code AS ResetCode,
                time_created AS TimeCreated
            FROM password_reset
            WHERE reset_code = @ResetCode";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<PasswordReset>(sql, new { ResetCode = resetCode });
    }

    public async Task<PasswordReset> CreateAsync(PasswordReset passwordReset)
    {
        const string sql = @"
            INSERT INTO password_reset (user_id, reset_code, time_created)
            VALUES (@UserId, @ResetCode, @TimeCreated)
            RETURNING 
                user_id AS UserId,
                reset_code AS ResetCode,
                time_created AS TimeCreated";

        passwordReset.TimeCreated = DateTime.UtcNow;

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<PasswordReset>(sql, passwordReset);
    }

    public async Task<bool> DeleteAsync(int userId)
    {
        const string sql = "DELETE FROM password_reset WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return affected > 0;
    }

    public async Task<int> DeleteExpiredAsync()
    {
        const string sql = "DELETE FROM password_reset WHERE time_created < @ThirtyDaysAgo";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.ExecuteAsync(sql, new 
        { 
            Now = DateTime.UtcNow,
            ThirtyDaysAgo = DateTime.UtcNow.AddDays(-30)
        });
    }
}