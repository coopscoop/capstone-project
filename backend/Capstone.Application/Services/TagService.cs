namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// Service for managing tag operations
/// </summary>
public class TagService : ITagService
{
    private readonly ITagRepository _tagRepository;
    private readonly ILogger<TagService> _logger;

    public TagService(
        ITagRepository tagRepository,
        ILogger<TagService> logger)
    {
        _tagRepository = tagRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<TagDto>> GetByPostIdAsync(int postId)
    {
        var tags = await _tagRepository.GetByPostIdAsync(postId);
        return tags.Select(MapToDto);
    }

    public async Task<IEnumerable<string>> GetAllUniqueTagsAsync()
    {
        var tags = await _tagRepository.GetAllTagsAsync();
        return tags.Select(t => t.TagName).Distinct().OrderBy(t => t);
    }

    public async Task<TagDto> AddTagToPostAsync(int postId, string tagName)
    {
        // Normalize tag name (trim whitespace, lowercase for consistency)
        var normalizedTagName = tagName.Trim().ToLower();

        var tag = new Tag
        {
            PostId = postId,
            TagName = normalizedTagName
        };

        var created = await _tagRepository.CreateAsync(tag);
        return MapToDto(created);
    }

    public async Task<bool> RemoveTagFromPostAsync(int postId, string tagName)
    {
        return await _tagRepository.DeleteAsync(postId, tagName);
    }

    public async Task<bool> RemoveAllTagsFromPostAsync(int postId)
    {
        return await _tagRepository.DeleteByPostIdAsync(postId);
    }

    private static TagDto MapToDto(Tag tag)
    {
        return new TagDto
        {
            PostId = tag.PostId,
            TagName = tag.TagName
        };
    }
}