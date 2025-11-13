namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;

/// <summary>
/// Service for user-related business logic
/// </summary>
public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ILogger<UserService> _logger;

    public PostService(
        IPostRepository postRepository,
        ILogger<UserService> logger)
    {
        _postRepository = postRepository;
        _logger = logger;
    }

    public async Task<PostDto> CreateAsync(PostDto postDto)
    {
        var post = new Post
        {
            Title = postDto.Title,
            Description = postDto.Description,
            NumberOfLikes = 0,
            Code = postDto.Code,
            UserId = postDto.UserId
        };

        var created = await _postRepository.CreateAsync(post);
        _logger.LogInformation("Created post {PostId} with title {Title}", created.PostId, created.Title);

        return MapToDto(created);
    }

    public async Task<bool> DeleteAsync(int postId)
    {
        var deleted = await _postRepository.DeleteAsync(postId);
        if (deleted)
        {
            _logger.LogInformation("Deleted post {PostId}", postId);
        }
        return deleted;
    }

    public async Task<IEnumerable<PostDto>> GetAllAsync()
    {
        var posts = await _postRepository.GetAllAsync();
        return posts.Select(MapToDto);
    }

    public async Task<PostDto?> GetByIdAsync(int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        return post == null ? null : MapToDto(post);
    }

    public async Task<IEnumerable<PostDto>> GetByTagAsync(string tagName)
    {
        var posts = await _postRepository.GetByTagAsync(tagName);
        return posts.Select(MapToDto);
    }

    public async Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId)
    {
        var posts = await _postRepository.GetByUserIdAsync(userId);
        return posts.Select(MapToDto);
    }

    public async Task<PostDto?> UpdateAsync(int postId, PostDto postDto)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
            return null;

        // Update only provided fields
        if (postDto.Title != null) 
            post.Title = postDto.Title;
        if (postDto.Description != null) 
            post.Description = postDto.Description;
        if (postDto.NumberOfLikes != null)
            post.NumberOfLikes = postDto.NumberOfLikes;
        if (postDto.Code != null) 
            post.Code = postDto.Code;

        await _postRepository.UpdateAsync(post);
        _logger.LogInformation("Updated post {PostId}", postId);

        return MapToDto(post);
    }

    private static PostDto MapToDto(Post post)
    {
        return new PostDto
        {
            PostId = post.PostId,
            UserId = post.UserId,
            Title = post.Title,
            Description = post.Description,
            NumberOfLikes = post.NumberOfLikes,
            Code = post.Code,
            Created = post.TimeCreated,
            LastEdited = post.LastEdited,
            Tags = new List<string>() // TODO: ADD TAGS - SOME JOIN NEEDED
        };
    }
}