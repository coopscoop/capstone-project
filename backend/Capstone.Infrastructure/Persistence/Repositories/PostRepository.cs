namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Reflection.Metadata.Ecma335;

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
        string sql;
        object parameters;
        
        if (isAdmin == true)
        {
            // Admins can see any post
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                LEFT JOIN tags t ON p.post_id = t.post_id
                WHERE p.post_id = @PostId";
            parameters = new { PostId = postId };
        }
        else if (currentUserId.HasValue)
        {
            // Authenticated users can see visible posts OR their own posts
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                LEFT JOIN tags t ON p.post_id = t.post_id
                WHERE p.post_id = @PostId AND (p.is_visible = TRUE OR p.user_id = @CurrentUserId)";
            parameters = new { PostId = postId, CurrentUserId = currentUserId.Value };
        }
        else
        {
            // Unauthenticated users can only see visible posts
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                LEFT JOIN tags t ON p.post_id = t.post_id
                WHERE p.post_id = @PostId AND p.is_visible = TRUE";
            parameters = new { PostId = postId };
        }

        var posts = await GetPostsWithTags(sql, parameters);
        return posts.FirstOrDefault();
    }

    public async Task<IEnumerable<Post>> GetByUserIdAsync(int userId, int? currentUserId = null, bool? isAdmin = null)
    {
        string sql;
        if (isAdmin == true || userId == currentUserId)
        {
            // Admins or users viewing their own posts can see all
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                LEFT JOIN tags t ON p.post_id = t.post_id
                WHERE p.user_id = @UserId
                ORDER BY p.created DESC";
        }
        else
        {
            // Regular users viewing others' posts can only see visible ones
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                LEFT JOIN tags t ON p.post_id = t.post_id
                WHERE p.user_id = @UserId AND p.is_visible = TRUE
                ORDER BY p.created DESC";
        }

        return await GetPostsWithTags(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<Post>> GetByTagAsync(string tagName, int? currentUserId = null, bool? isAdmin = null)
    {
        _logger.LogInformation("Retrieving posts by tag {TagName} for user {CurrentUserId} (IsAdmin: {IsAdmin})", tagName, currentUserId, isAdmin);
        string sql;
        object parameters;
        
        if (isAdmin == true)
        {
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                JOIN tags t ON p.post_id = t.post_id
                WHERE t.tag_name = @TagName
                ORDER BY p.created DESC";
            parameters = new { TagName = tagName };
        }
        else if (currentUserId.HasValue)
        {
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                JOIN tags t ON p.post_id = t.post_id
                WHERE t.tag_name = @TagName AND (p.is_visible = TRUE OR p.user_id = @CurrentUserId)
                ORDER BY p.created DESC";
            parameters = new { TagName = tagName, CurrentUserId = currentUserId.Value };
        }
        else
        {
            sql = @"
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
                    t.tag_name AS TagName
                FROM posts p
                JOIN tags t ON p.post_id = t.post_id
                WHERE t.tag_name = @TagName AND p.is_visible = TRUE
                ORDER BY p.created DESC";
            parameters = new { TagName = tagName };
        }

        return await GetPostsWithTags(sql, parameters);
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

    // Helper method to handle the tag mapping
    private async Task<IEnumerable<Post>> GetPostsWithTags(string sql, object? parameters = null)
    {
        await using var connection = _dbConnection.CreateConnection();
        
        var postDictionary = new Dictionary<int, Post>();
        
        await connection.QueryAsync<Post, string, Post>(
            sql,
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
            parameters,
            splitOn: "TagName"
        );

        return postDictionary.Values;
    }
}