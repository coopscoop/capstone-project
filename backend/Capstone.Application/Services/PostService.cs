namespace Capstone.Application.Services;

using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using Capstone.Core.Models.Dtos;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly ITagRepository _tagRepository;
    private readonly ILogger<PostService> _logger;

    public PostService(
        IPostRepository postRepository,
        ITagRepository tagRepository, // Add this
        ILogger<PostService> logger)
    {
        _postRepository = postRepository;
        _tagRepository = tagRepository; // Add this
        _logger = logger;
    }

    public async Task<IEnumerable<PostDto>> GetAllAsync()
    {
        var posts = await _postRepository.GetAllAsync();
        
        // Load tags for each post
        var postDtos = new List<PostDto>();
        foreach (var post in posts)
        {
            var dto = await MapToDto(post);
            postDtos.Add(dto);
        }
        
        return postDtos;
    }

    public async Task<PostDto?> GetByIdAsync(int postId)
    {
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null) return null;
        
        return await MapToDto(post);
    }

    public async Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId)
    {
        var posts = await _postRepository.GetByUserIdAsync(userId);
        
        var postDtos = new List<PostDto>();
        foreach (var post in posts)
        {
            var dto = await MapToDto(post);
            postDtos.Add(dto);
        }
        
        return postDtos;
    }

    public async Task<IEnumerable<PostDto>> GetByTagAsync(string tagName)
    {
        var posts = await _postRepository.GetByTagAsync(tagName);
        
        var postDtos = new List<PostDto>();
        foreach (var post in posts)
        {
            var dto = await MapToDto(post);
            postDtos.Add(dto);
        }
        
        return postDtos;
    }

    public async Task<PostDto> CreateAsync(PostDto postDto)
    {
        var post = new Post
        {
            UserId = postDto.UserId,
            Title = postDto.Title,
            Description = postDto.Description,
            NumberOfLikes = 0,
            Code = postDto.Code
        };

        var created = await _postRepository.CreateAsync(post);
        return await MapToDto(created);
    }

    public async Task<PostDto?> UpdateAsync(int postId, PostDto postDto)
    {
        var existingPost = await _postRepository.GetByIdAsync(postId);
        if (existingPost == null) return null;

        existingPost.Title = postDto.Title;
        existingPost.Description = postDto.Description;
        existingPost.Code = postDto.Code;
        existingPost.LastEdited = DateTime.UtcNow;

        var success = await _postRepository.UpdateAsync(existingPost);
        if (!success) return null;

        return await MapToDto(existingPost);
    }

    public async Task<bool> DeleteAsync(int postId)
    {
        return await _postRepository.DeleteAsync(postId);
    }

    // Helper method to map Post to PostDto with tags
    private async Task<PostDto> MapToDto(Post post)
    {
        // Get tags for this post
        var tags = await _tagRepository.GetByPostIdAsync(post.PostId);
        var tagNames = tags.Select(t => t.TagName).ToList();

        return new PostDto
        {
            PostId = post.PostId,
            UserId = post.UserId,
            Title = post.Title,
            Description = post.Description,
            NumberOfLikes = post.NumberOfLikes,
            Code = post.Code,
            Created = post.Created,
            LastEdited = post.LastEdited,
            Tags = tagNames
        };
    }
}