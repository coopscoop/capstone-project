namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;
using System.Collections.Generic;

/// <summary>
/// Tag repository implementation using Dapper
/// </summary>
public class TagRepository : ITagRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<TagRepository> _logger;

    public TagRepository(
        DatabaseConnection dbConnection,
        ILogger<TagRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<IEnumerable<Tag>> GetByPostIdAsync(int postId)
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                tag_name AS TagName
            FROM tags
            WHERE post_id = @PostId
            ORDER BY tag_name";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Tag>(sql, new { PostId = postId });
    }

    public async Task<IEnumerable<Tag>> GetAllTagsAsync()
    {
        const string sql = @"
            SELECT 
                post_id AS PostId,
                tag_name AS TagName
            FROM tags
            ORDER BY tag_name";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QueryAsync<Tag>(sql);
    }

    public async Task<Tag> CreateAsync(Tag tag)
    {
        const string sql = @"
            INSERT INTO tags (post_id, tag_name)
            VALUES (@PostId, @TagName)
            RETURNING 
                post_id AS PostId,
                tag_name AS TagName";

        await using var connection = _dbConnection.CreateConnection();
        return await connection.QuerySingleAsync<Tag>(sql, tag);
    }

    public async Task<bool> DeleteAsync(int postId, string tagName)
    {
        const string sql = "DELETE FROM tags WHERE post_id = @PostId AND tag_name = @TagName";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId, TagName = tagName });
        return affected > 0;
    }

    public async Task<bool> DeleteByPostIdAsync(int postId)
    {
        const string sql = "DELETE FROM tags WHERE post_id = @PostId";

        await using var connection = _dbConnection.CreateConnection();
        var affected = await connection.ExecuteAsync(sql, new { PostId = postId });
        return affected > 0;
    }
}