namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;

/// <summary>
/// API endpoints for user management
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postsService;
    private readonly ILogger<PostsController> _logger;

    public PostsController(
        IPostService postsService,
        ILogger<PostsController> logger)
    {
        _postsService = postsService;
        _logger = logger;
    }

    // need to add endpoints for:
    // - get all posts
    // - get post by ID
    // - create post
    // - update post
    // - delete post
    // - get posts by user
    // - get posts by tag

    /// <summary>
    /// Get all posts
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetAll()
    {
        var posts = await _postsService.GetAllAsync();
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
        var post = await _postsService.GetByIdAsync(id);
        
        if (post == null)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

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
    public async Task<ActionResult<PostDto>> Update(int id, [FromBody] PostDto postDto)
    {
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
    public async Task<ActionResult> Delete(int id)
    {
        var deleted = await _postsService.DeleteAsync(id);

        if (!deleted)
            return NotFound(new { error = $"Post with ID '{id}' not found" });

        return NoContent();
    }
    
    /// <summary>
    /// Get posts by user
    /// </summary>
    [HttpGet("user/{userId:int}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByUserId(int userId)
    {
        var posts = await _postsService.GetByUserIdAsync(userId);
        return Ok(posts);
    }

    /// <summary>
    /// Get posts by tag
    /// </summary>
    [HttpGet("tag/{tagName}")]
    [ProducesResponseType(typeof(IEnumerable<PostDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetByTag(string tagName)
    {
        var posts = await _postsService.GetByTagAsync(tagName);
        return Ok(posts);
    }
}