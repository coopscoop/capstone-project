namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ILogger<PostService> _logger;

    public PostService(
        IPostRepository postRepository,
        ILogger<PostService> logger)
    {
        _postRepository = postRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<PostDto>> GetAllAsync(int? currentUserId = null, bool? isAdmin = null)
    {
        var posts = await _postRepository.GetAllAsync(currentUserId, isAdmin);
        return posts.Select(MapToDto);
    }

    public async Task<PostDto?> GetByIdAsync(int postId, int? currentUserId = null, bool? isAdmin = null)
    {
        var post = await _postRepository.GetByIdAsync(postId, currentUserId, isAdmin);
        
        // If post is null, return an empty dto
        if (post == null) return new PostDto();
        return MapToDto(post);
    }

    public async Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId, int? currentUserId = null, bool? isAdmin = null)
    {
        var posts = await _postRepository.GetByUserIdAsync(userId, currentUserId, isAdmin);
        return posts.Select(MapToDto);
    }

    public async Task<IEnumerable<PostDto>> GetByTagAsync(string tagName, int? currentUserId = null, bool? isAdmin = null)
    {
        var posts = await _postRepository.GetByTagAsync(tagName, currentUserId, isAdmin);
        return posts.Select(MapToDto);
    }

    public async Task<PostDto> CreateAsync(PostDto postDto)
    {
        var post = new Post
        {
            UserId = postDto.UserId,
            Title = postDto.Title,
            Description = postDto.Description,
            NumberOfLikes = 0,
            Code = postDto.Code,
            IsVisible = postDto.IsVisible
        };

        var created = await _postRepository.CreateAsync(post);
        return MapToDto(created);
    }

    public async Task<PostDto?> UpdateAsync(int postId, PostDto postDto)
    {
        var existingPost = await _postRepository.GetByIdAsync(postId);
        if (existingPost == null) return null;

        existingPost.Title = postDto.Title;
        existingPost.Description = postDto.Description;
        existingPost.Code = postDto.Code;
        existingPost.IsVisible = postDto.IsVisible;
        existingPost.LastEdited = DateTime.UtcNow;

        var success = await _postRepository.UpdateAsync(existingPost);
        if (!success) return null;

        return MapToDto(existingPost);
    }

    public async Task<bool> DeleteAsync(int postId)
    {
        return await _postRepository.DeleteAsync(postId);
    }

    // Helper method to map Post to PostDto
    private PostDto MapToDto(Post post)
    {
        return new PostDto
        {
            PostId = post.PostId,
            UserId = post.UserId,
            Title = post.Title,
            Description = post.Description,
            NumberOfLikes = post.NumberOfLikes,
            Code = post.Code,
            IsVisible = post.IsVisible,
            Created = post.Created,
            LastEdited = post.LastEdited,
            Tags = post.Tags ?? new List<string>()
        };
    }
}