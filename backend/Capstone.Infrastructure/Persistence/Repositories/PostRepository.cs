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
public class PostRepository : IPostRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<PostRepository> _logger;

    public PostRepository(
        DatabaseConnection dbConnection,
        ILogger<PostRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<Post> CreateAsync(Post post)
    {
        const string sql = @"
            INSERT INTO posts (
                user_id,
                title,
                description,
                number_of_likes,
                code,
                is_visible,
                created,
                last_edited
            )
            VALUES (
                @UserId,
                @Title,
                @Description,
                @NumberOfLikes,
                @Code,
                @IsVisible,
                @Created,
                @LastEdited
            )
            RETURNING 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                code AS Code,
                is_visible AS IsVisible,
                created AS Created,
                last_edited AS LastEdited";

        post.Created = DateTime.UtcNow;
        post.LastEdited = DateTime.UtcNow;

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<Post>(sql, post);
    }

    public async Task<bool> DecrementLikesAsync(int postId)
    {
        const string sql = "UPDATE posts SET number_of_likes = number_of_likes - 1 WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId });
        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int postId)
    {
        const string sql = "DELETE FROM posts WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId });
        return affected > 0;
    }

    public async Task<IEnumerable<Post>> GetAllAsync(int? currentUserId = null, bool? isAdmin = null)
    {
        _logger.LogInformation("Retrieving all posts for user {CurrentUserId} (IsAdmin: {IsAdmin})", currentUserId, isAdmin);

        var sql = @"
            SELECT 
                p.post_id AS PostId,
                p.user_id AS UserId,
                p.title AS Title,
                p.description AS Description,
                p.number_of_likes AS NumberOfLikes,
                p.code AS Code,
                p.is_visible AS IsVisible,
                p.created AS Created,
                p.last_edited AS LastEdited,
                ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS Tags
            FROM posts p
            LEFT JOIN tags pt ON p.post_id = pt.post_id
            LEFT JOIN tags t ON pt.post_id = t.post_id
            WHERE (@isAdmin = true OR p.is_visible = true OR p.user_id = @currentUserId)
            GROUP BY p.post_id
            ORDER BY p.created DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql, new { currentUserId, isAdmin });
    }

    public async Task<Post?> GetByIdAsync(int postId, int? currentUserId = null, bool? isAdmin = null)
    {
        _logger.LogInformation("Retrieving post by ID {PostId} for user {CurrentUserId} (IsAdmin: {IsAdmin})", postId, currentUserId, isAdmin);

        var sql = @"
            SELECT 
                p.post_id AS PostId,
                p.user_id AS UserId,
                p.title AS Title,
                p.description AS Description,
                p.number_of_likes AS NumberOfLikes,
                p.code AS Code,
                p.is_visible AS IsVisible,
                p.created AS Created,
                p.last_edited AS LastEdited,
                ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS Tags
            FROM posts p
            LEFT JOIN tags pt ON p.post_id = pt.post_id
            LEFT JOIN tags t ON pt.post_id = t.post_id
            WHERE p.post_id = @PostId
            GROUP BY p.post_id
            ORDER BY p.created DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<Post>(sql, new { PostId = postId });
    }

    public async Task<IEnumerable<Post>> GetByUserIdAsync(int userId, int? currentUserId = null, bool? isAdmin = null)
    {
        _logger.LogInformation("Retrieving posts by user {UserId} for user {CurrentUserId} (IsAdmin: {IsAdmin})", userId, currentUserId, isAdmin);

        var sql = @"
            SELECT 
                p.post_id AS PostId,
                p.user_id AS UserId,
                p.title AS Title,
                p.description AS Description,
                p.number_of_likes AS NumberOfLikes,
                p.code AS Code,
                p.is_visible AS IsVisible,
                p.created AS Created,
                p.last_edited AS LastEdited,
                ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS Tags
            FROM posts p
            LEFT JOIN tags pt ON p.post_id = pt.post_id
            LEFT JOIN tags t ON pt.post_id = t.post_id
            WHERE p.user_id = @UserId
            GROUP BY p.post_id
            ORDER BY p.created DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Post>> GetByTagAsync(string tagName, int? currentUserId = null, bool? isAdmin = null)
    {
        _logger.LogInformation("Retrieving posts by tag {TagName} for user {CurrentUserId} (IsAdmin: {IsAdmin})", tagName, currentUserId, isAdmin);
        
        var sql = @"
            SELECT 
                p.post_id AS PostId,
                p.user_id AS UserId,
                p.title AS Title,
                p.description AS Description,
                p.number_of_likes AS NumberOfLikes,
                p.code AS Code,
                p.is_visible AS IsVisible,
                p.created AS Created,
                p.last_edited AS LastEdited,
                ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS Tags
            FROM posts p
            JOIN tags t ON p.post_id = t.post_id
            WHERE t.tag_name = @TagName
            GROUP BY p.post_id
            ORDER BY p.created DESC";
        
        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql, new { TagName = tagName });
    }

    public async Task<bool> IncrementLikesAsync(int postId)
    {
        const string sql = "UPDATE posts SET number_of_likes = number_of_likes + 1 WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId });
        return affected > 0;
    }

    public async Task<bool> UpdateAsync(Post post)
    {
        const string sql = @"
            UPDATE posts 
            SET 
                title = @Title,
                description = @Description,
                number_of_likes = @NumberOfLikes,
                code = @Code,
                is_visible = @IsVisible,
                last_edited = @LastEdited
            WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, post);
        return affected > 0;
    }
}