namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;

/// <summary>
/// Controller for managing tags
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TagController : ControllerBase
{
    private readonly ITagService _tagService;
    private readonly ILogger<TagController> _logger;

    public TagController(
        ITagService tagService,
        ILogger<TagController> logger)
    {
        _tagService = tagService;
        _logger = logger;
    }

    /// <summary>
    /// Get all tags for a specific post
    /// </summary>
    [HttpGet("post/{postId}")]
    public async Task<ActionResult<IEnumerable<TagDto>>> GetByPostId(int postId)
    {
        try
        {
            var tags = await _tagService.GetByPostIdAsync(postId);
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting tags for post {PostId}", postId);
            return StatusCode(500, "An error occurred while retrieving tags");
        }
    }

    /// <summary>
    /// Get all unique tag names across all posts
    /// </summary>
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<string>>> GetAllUniqueTags()
    {
        try
        {
            var tags = await _tagService.GetAllUniqueTagsAsync();
            return Ok(tags);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all unique tags");
            return StatusCode(500, "An error occurred while retrieving tags");
        }
    }

    /// <summary>
    /// Add a tag to a post
    /// </summary>
    [HttpPost("{postId}")]
    public async Task<ActionResult<TagDto>> AddTagToPost(int postId, [FromBody] AddTagRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.TagName))
            {
                return BadRequest("Tag name cannot be empty");
            }

            var tag = await _tagService.AddTagToPostAsync(postId, request.TagName);
            return CreatedAtAction(nameof(GetByPostId), new { postId }, tag);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding tag {TagName} to post {PostId}", request.TagName, postId);
            return StatusCode(500, "An error occurred while adding tag");
        }
    }

    /// <summary>
    /// Remove a specific tag from a post
    /// </summary>
    [HttpDelete("{postId}/{tagName}")]
    public async Task<ActionResult> RemoveTagFromPost(int postId, string tagName)
    {
        try
        {
            var success = await _tagService.RemoveTagFromPostAsync(postId, tagName);
            if (!success)
            {
                return NotFound("Tag not found for this post");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing tag {TagName} from post {PostId}", tagName, postId);
            return StatusCode(500, "An error occurred while removing tag");
        }
    }

    /// <summary>
    /// Remove all tags from a post
    /// </summary>
    [HttpDelete("post/{postId}")]
    public async Task<ActionResult> RemoveAllTagsFromPost(int postId)
    {
        try
        {
            var success = await _tagService.RemoveAllTagsFromPostAsync(postId);
            if (!success)
            {
                return NotFound("No tags found for this post");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing all tags from post {PostId}", postId);
            return StatusCode(500, "An error occurred while removing tags");
        }
    }
}

/// <summary>
/// Request model for adding a tag
/// </summary>
public class AddTagRequest
{
    public string TagName { get; set; } = string.Empty;
}