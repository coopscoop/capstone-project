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
                file_location,
                created,
                last_edited,
                time_created
            )
            VALUES (
                @UserId,
                @Title,
                @Description,
                @NumberOfLikes,
                @FileLocation,
                @Created,
                @LastEdited,
                @TimeCreated
            )
            RETURNING 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                file_location AS FileLocation,
                created AS Created,
                last_edited AS LastEdited,
                time_created AS TimeCreated";

        post.TimeCreated = DateTime.UtcNow;
        
        // When it's created, just set the last edited time to the same as the created time
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

    public async Task<IEnumerable<Post>> GetAllAsync()
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                file_location AS FileLocation,
                created AS Created,
                last_edited AS LastEdited,
                time_created AS TimeCreated
            FROM posts 
            ORDER BY time_created DESC";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql);
    }

    public async Task<Post?> GetByIdAsync(int postId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                file_location AS FileLocation,
                created AS Created,
                last_edited AS LastEdited,
                time_created AS TimeCreated
            FROM posts 
            WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Post>(sql, new { PostId = postId });
    }

    public async Task<IEnumerable<Post>> GetByTagAsync(string tagName)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                file_location AS FileLocation,
                created AS Created,
                last_edited AS LastEdited,
                time_created AS TimeCreated
            FROM posts 
            WHERE tag_name = @TagName";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql, new { TagName = tagName });
    }

    public async Task<IEnumerable<Post>> GetByUserIdAsync(int userId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                user_id AS UserId,
                title AS Title,
                description AS Description,
                number_of_likes AS NumberOfLikes,
                file_location AS FileLocation,
                created AS Created,
                last_edited AS LastEdited,
                time_created AS TimeCreated
            FROM posts 
            WHERE user_id = @UserId";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Post>(sql, new { UserId = userId });
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
                file_location = @FileLocation,
                last_edited = @LastEdited
            WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, post);
        return affected > 0;
    }
}