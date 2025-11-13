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

    public Task<Post> CreateAsync(Post post)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DecrementLikesAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Post>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Post?> GetByIdAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Post>> GetByTagAsync(string tagName)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Post>> GetByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> IncrementLikesAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public Task<Post?> UpdateAsync(Post post)
    {
        throw new NotImplementedException();
    }
}