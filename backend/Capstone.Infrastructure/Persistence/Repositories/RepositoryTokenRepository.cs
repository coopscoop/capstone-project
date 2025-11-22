namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<RefreshTokenRepository> _logger;

    public RefreshTokenRepository(
        DatabaseConnection dbConnection,
        ILogger<RefreshTokenRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        const string sql = @"
            SELECT 
                token_id AS TokenId,
                user_id AS UserId,
                token AS Token,
                expires_at AS ExpiresAt,
                created_at AS CreatedAt,
                revoked AS Revoked,
                revoked_at AS RevokedAt,
                replaced_by_token AS ReplacedByToken
            FROM refresh_tokens
            WHERE token = @Token";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<RefreshToken>(sql, new { Token = token });
    }

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        const string sql = @"
            INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
            VALUES (@UserId, @Token, @ExpiresAt, @CreatedAt)
            RETURNING 
                token_id AS TokenId,
                user_id AS UserId,
                token AS Token,
                expires_at AS ExpiresAt,
                created_at AS CreatedAt,
                revoked AS Revoked,
                revoked_at AS RevokedAt,
                replaced_by_token AS ReplacedByToken";

        refreshToken.CreatedAt = DateTime.UtcNow;

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<RefreshToken>(sql, refreshToken);
    }

    public async Task<bool> RevokeAsync(string token, string? replacedByToken = null)
    {
        const string sql = @"
            UPDATE refresh_tokens 
            SET 
                revoked = TRUE,
                revoked_at = @RevokedAt,
                replaced_by_token = @ReplacedByToken
            WHERE token = @Token";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new 
        { 
            Token = token, 
            RevokedAt = DateTime.UtcNow,
            ReplacedByToken = replacedByToken
        });
        return affected > 0;
    }

    public async Task<bool> RevokeAllForUserAsync(int userId)
    {
        const string sql = @"
            UPDATE refresh_tokens 
            SET 
                revoked = TRUE,
                revoked_at = @RevokedAt
            WHERE user_id = @UserId AND revoked = FALSE";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new 
        { 
            UserId = userId,
            RevokedAt = DateTime.UtcNow
        });
        return affected > 0;
    }

    public async Task<int> DeleteExpiredAsync()
    {
        const string sql = @"
            DELETE FROM refresh_tokens 
            WHERE expires_at < @Now OR (revoked = TRUE AND revoked_at < @ThirtyDaysAgo)";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.ExecuteAsync(sql, new 
        { 
            Now = DateTime.UtcNow,
            ThirtyDaysAgo = DateTime.UtcNow.AddDays(-30)
        });
    }
}