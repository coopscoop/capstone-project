namespace Capstone.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Dtos;

/// <summary>
/// Controller for managing favourites
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class FavouriteController : ControllerBase
{
    private readonly IFavouriteService _favouriteService;
    private readonly IPostService _postService; // Used to increment favourite count
    private readonly ILogger<FavouriteController> _logger;

    public FavouriteController(
        IFavouriteService favouriteService,
        IPostService postService,
        ILogger<FavouriteController> logger)
    {
        _favouriteService = favouriteService;
        _postService = postService;
        _logger = logger;
    }

    /// <summary>
    /// Get all favourites for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<FavouriteDto>>> GetUserFavourites(int userId)
    {
        try
        {
            var favourites = await _favouriteService.GetUserFavouritesAsync(userId);
            return Ok(favourites);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting favourites for user {UserId}", userId);
            return StatusCode(500, "An error occurred while retrieving favourites");
        }
    }

    /// <summary>
    /// Get all users who favourited a specific post
    /// </summary>
    [HttpGet("post/{postId}")]
    public async Task<ActionResult<IEnumerable<FavouriteDto>>> GetPostFavourites(int postId)
    {
        try
        {
            var favourites = await _favouriteService.GetPostFavouritesAsync(postId);
            return Ok(favourites);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting favourites for post {PostId}", postId);
            return StatusCode(500, "An error occurred while retrieving favourites");
        }
    }

    /// <summary>
    /// Check if a post is favourited by a user
    /// </summary>
    [HttpGet("check/{postId}/{userId}")]
    public async Task<ActionResult<bool>> IsFavourited(int postId, int userId)
    {
        try
        {
            var isFavourited = await _favouriteService.IsFavouritedAsync(postId, userId);
            return Ok(isFavourited);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if post {PostId} is favourited by user {UserId}", postId, userId);
            return StatusCode(500, "An error occurred while checking favourite status");
        }
    }

    /// <summary>
    /// Add a favourite
    /// </summary>
    [HttpPost("{postId}/{userId}")]
    public async Task<ActionResult<FavouriteDto>> AddFavourite(int postId, int userId)
    {
        try
        {
            var favourite = await _favouriteService.AddFavouriteAsync(postId, userId);

            // if the favourite is added, increment the post's favourite count
            if (favourite != null)
            {
                await _postService.IncrementLikesAsync(postId);
            }

            return CreatedAtAction(nameof(IsFavourited), new { postId, userId }, favourite);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding favourite for post {PostId} by user {UserId}", postId, userId);
            return StatusCode(500, "An error occurred while adding favourite");
        }
    }

    /// <summary>
    /// Remove a favourite
    /// </summary>
    [HttpDelete("{postId}/{userId}")]
    public async Task<ActionResult> RemoveFavourite(int postId, int userId)
    {
        try
        {
            var success = await _favouriteService.RemoveFavouriteAsync(postId, userId);
            if (!success)
            {
                return NotFound("Favourite not found");
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing favourite for post {PostId} by user {UserId}", postId, userId);
            return StatusCode(500, "An error occurred while removing favourite");
        }
    }

    /// <summary>
    /// Get favourite count for a post
    /// </summary>
    [HttpGet("count/{postId}")]
    public async Task<ActionResult<int>> GetFavouriteCount(int postId)
    {
        try
        {
            var count = await _favouriteService.GetFavouriteCountAsync(postId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting favourite count for post {PostId}", postId);
            return StatusCode(500, "An error occurred while retrieving favourite count");
        }
    }
}