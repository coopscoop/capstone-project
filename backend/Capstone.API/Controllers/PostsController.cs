namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;
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
    /// Get all posts
    /// Automatically applies visibility rules based on current user status
    /// If the user is an admin, all posts are returned
    /// If the user is a regular user, only visible posts, plus their own regardless of visibility rules, are returned
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        var posts = await _postsService.GetAllAsync(_userContext.UserId, _userContext.IsAdmin);

        _logger.LogInformation("Retrieved {Count} posts for user {UserId} (IsAdmin: {IsAdmin})", posts.Count(), _userContext.UserId, _userContext.IsAdmin);

        return Ok(posts);
    }

    [HttpGet("userfavourites/{userId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAllUserFavourites(int userId)
    {
        var posts = await _postsService.GetAllUserFavouritesAsync(userId);

        _logger.LogInformation("Retrieved {Count} posts for user {UserId} (IsAdmin: {IsAdmin})", posts.Count(), _userContext.UserId, _userContext.IsAdmin);

        return Ok(posts);
    }

    /// <summary>
    /// Get post by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PostDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize]
    public async Task<ActionResult<PostDto>> GetById(int id)
    {
        var post = await _postsService.GetByIdAsync(id, _userContext.UserId, _userContext.IsAdmin);
        
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
    [Authorize]
    public async Task<ActionResult<PostDto>> Create([FromBody] PostDto postDto)
    {
        _logger.LogInformation("User {UserId} (IsAdmin: {IsAdmin}) is attempting to create a post for User {PostUserId}", _userContext.UserId, _userContext.IsAdmin, postDto.UserId);

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
    [Authorize]
    public async Task<ActionResult<PostDto>> Update(int id, [FromBody] PostDto postDto)
    {
        // Check if user owns the post or is admin
        var existingPost = await _postsService.GetByIdAsync(id, _userContext.UserId, _userContext.IsAdmin);
        if (existingPost == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        if (existingPost.UserId != _userContext.UserId && !_userContext.IsAdmin)
            return Forbid();

        var post = await _postsService.UpdateAsync(id, postDto, _userContext.UserId, _userContext.IsAdmin);
        
        if (post == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });
        
        _logger.LogInformation("Updated post {PostId} by user {UserId}", post.PostId, _userContext.UserId);

        return Ok(post);
    }

    /// <summary>
    /// Delete post
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [Authorize]
    public async Task<ActionResult> Delete(int id)
    {
        _logger.LogWarning("User {UserId} is not authorized to delete post {PostId}", _userContext.UserId, id);

        // Check if user owns the post or is admin
        var existingPost = await _postsService.GetByIdAsync(id, _userContext.UserId, _userContext.IsAdmin);
        if (existingPost == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        if (existingPost.UserId != _userContext.UserId && !_userContext.IsAdmin)
        {
            return Forbid();
        }

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
    [Authorize]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByUserId(int userId)
    {
        var posts = await _postsService.GetByUserIdAsync(userId, _userContext.UserId, _userContext.IsAdmin);
        return Ok(posts);
    }

    /// <summary>
    /// Get posts by tag (with visibility rules applied)
    /// </summary>
    [HttpGet("tag/{tagName}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    [Authorize]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByTag(string tagName)
    {
        var posts = await _postsService.GetByTagAsync(tagName, _userContext.UserId, _userContext.IsAdmin);
        return Ok(posts);
    }
}