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
public class TagService : ITagService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public TagService(
        IUserRepository userRepository,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<TagDto> AddTagToPostAsync(int postId, string tagName)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<string>> GetAllUniqueTagsAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<TagDto>> GetByPostIdAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> RemoveAllTagsFromPostAsync(int postId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> RemoveTagFromPostAsync(int postId, string tagName)
    {
        throw new NotImplementedException();
    }
}