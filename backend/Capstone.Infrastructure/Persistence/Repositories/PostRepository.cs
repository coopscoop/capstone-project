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
                created,
                last_edited
            )
            VALUES (
                @UserId,
                @Title,
                @Description,
                @NumberOfLikes,
                @Code,
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
                created AS Created,
                last_edited AS LastEdited";

        post.Created = DateTime.UtcNow;
        
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
        // join to get the tags
        const string sql = @"
            SELECT 
                p.post_id AS PostId,
                p.user_id AS UserId,
                p.title AS Title,
                p.description AS Description,
                p.number_of_likes AS NumberOfLikes,
                p.code AS Code,
                p.created AS Created,
                p.last_edited AS LastEdited,
                t.tag_name AS TagName
            FROM posts p
            LEFT JOIN tags t ON p.post_id = t.post_id
            ORDER BY p.created DESC";

        await using var connection = _dbConnection.CreateConnection();
        
        var postDictionary = new Dictionary<int, Post>();
        
        await connection.QueryAsync<Post, string, Post>(
            sql,
            // weird and annoying but it gets the tags then maps them to the post
            (post, tagName) =>
            {
                if (!postDictionary.TryGetValue(post.PostId, out var postEntry))
                {
                    postEntry = post;
                    postEntry.Tags = new List<string>();
                    postDictionary.Add(post.PostId, postEntry);
                }

                if (!string.IsNullOrEmpty(tagName))
                {
                    postEntry.Tags.Add(tagName);
                }

                return postEntry;
            },
            splitOn: "TagName"
        );

        return postDictionary.Values;
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
                code AS Code,
                created AS Created,
                last_edited AS LastEdited,
                created AS Created
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
                code AS Code,
                created AS Created,
                last_edited AS LastEdited,
                created AS Created
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
                code AS Code,
                created AS Created,
                last_edited AS LastEdited,
                created AS Created
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
                code = @Code,
                last_edited = @LastEdited
            WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, post);
        return affected > 0;
    }
}