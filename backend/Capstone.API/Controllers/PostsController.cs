namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// API endpoints for post management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postsService;
    private readonly ILogger<PostsController> _logger;
    private readonly IUserContextService _userContext;

    public PostsController(
        IPostService postsService,
        ILogger<PostsController> logger,
        IUserContextService userContext)
    {
        _postsService = postsService;
        _logger = logger;
        _userContext = userContext;
    }

    /// <summary>
    /// Helper method to get current user info from claims
    /// </summary>
    /// <returns></returns>
    private (int userId, bool isAdmin) GetCurrentUserInfo()
    {
        return (_userContext.UserId ?? 0, _userContext.IsAdmin);
    }

    /// <summary>
    /// Get all posts
    /// Automatically applies visibility rules based on current user status
    /// If the user is an admin, all posts are returned
    /// If the user is a regular user, only visible posts, plus their own regardless of visibility rules, are returned
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        var posts = await _postsService.GetAllAsync(currentUserId, isAdmin);

        _logger.LogInformation("Retrieved {Count} posts for user {UserId} (IsAdmin: {IsAdmin})", posts.Count(), currentUserId, isAdmin);

        return Ok(posts);
    }

    /// <summary>
    /// Get post by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PostDto>> GetById(int id)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        var post = await _postsService.GetByIdAsync(id, currentUserId, isAdmin);
        
        if (post == null)
            return NotFound(new { error = $"Post with ID '{id}' not found or access denied" });

        return Ok(post);
    }

    /// <summary>
    /// Create new post
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PostDto>> Create([FromBody] PostDto postDto)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();

        _logger.LogInformation("User {UserId} (IsAdmin: {IsAdmin}) is attempting to create a post for User {PostUserId}", currentUserId, isAdmin, postDto.UserId);
        
        // if (currentUserId == 0)
        //     return Unauthorized(new { error = "Authentication required to create posts" });

        // Ensure the user can only create posts for themselves
        // if (postDto.UserId != currentUserId && !isAdmin)
        //     return Forbid();

        try
        {
            var post = await _postsService.CreateAsync(postDto);
            return CreatedAtAction(nameof(GetById), new { id = post.PostId }, post);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Update post
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PostDto>> Update(int id, [FromBody] PostDto postDto)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        
        // if (currentUserId == 0)
        //     return Unauthorized(new { error = "Authentication required to update posts" });

        // Check if user owns the post or is admin
        var existingPost = await _postsService.GetByIdAsync(id);
        if (existingPost == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        // if (existingPost.UserId != currentUserId && !isAdmin)
        //     return Forbid();

        var post = await _postsService.UpdateAsync(id, postDto);
        
        if (post == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        return Ok(post);
    }

    /// <summary>
    /// Delete post
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> Delete(int id)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        
        if (currentUserId == 0)
            return Unauthorized(new { error = "Authentication required to delete posts" });

        // Check if user owns the post or is admin
        var existingPost = await _postsService.GetByIdAsync(id);
        if (existingPost == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        if (existingPost.UserId != currentUserId && !isAdmin)
            return Forbid();

        var deleted = await _postsService.DeleteAsync(id);

        if (!deleted)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        return NoContent();
    }
    
    /// <summary>
    /// Get posts by user (with visibility rules applied)
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByUserId(int userId)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        var posts = await _postsService.GetByUserIdAsync(userId, currentUserId, isAdmin);
        return Ok(posts);
    }

    /// <summary>
    /// Get posts by tag (with visibility rules applied)
    /// </summary>
    [HttpGet("tag/{tagName}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByTag(string tagName)
    {
        var (currentUserId, isAdmin) = GetCurrentUserInfo();
        var posts = await _postsService.GetByTagAsync(tagName, currentUserId, isAdmin);
        return Ok(posts);
    }
}