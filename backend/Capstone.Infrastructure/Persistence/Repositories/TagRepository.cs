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
public class TagRepository : ITagRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<PostRepository> _logger;

    public TagRepository(
        DatabaseConnection dbConnection,
        ILogger<PostRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public Task<Tag> CreateAsync(Tag tag)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int postId, string tagName)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteByPostIdAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Tag>> GetAllTagsAsync()
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Tag>> GetByPostIdAsync(int postId)
    {
        throw new NotImplementedException();
    }
}