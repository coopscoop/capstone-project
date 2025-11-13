namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.DTOs;
using System.Threading.Tasks;
using Capstone.Core.Models.Dtos;
using System.Collections.Generic;

/// <summary>
/// Service for user-related business logic
/// </summary>
public class PostService : IPostService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public PostService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<PostDto> CreateAsync(PostDto postDto)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> DeleteAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<PostDto>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<PostDto?> GetByIdAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<PostDto>> GetByTagAsync(string tagName)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<PostDto?> UpdateAsync(int postId, PostDto postDto)
    {
        throw new NotImplementedException();
    }
}