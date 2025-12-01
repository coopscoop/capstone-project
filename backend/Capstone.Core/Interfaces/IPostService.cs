using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetAllAsync(int? currentUserId = null, bool? isAdmin = null);
    Task<PostDto?> GetByIdAsync(int postId, int? currentUserId = null, bool? isAdmin = null);
    Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId, int? currentUserId = null, bool? isAdmin = null);
    Task<IEnumerable<PostDto>> GetByTagAsync(string tagName, int? currentUserId = null, bool? isAdmin = null);
    Task<PostDto> CreateAsync(PostDto postDto);
    Task<PostDto?> UpdateAsync(int postId, PostDto postDto, int? currentUserId = null, bool? isAdmin = null);
    Task<bool> IncrementLikesAsync(int postId);
    Task<bool> DecrementLikesAsync(int postId);
    Task<bool> DeleteAsync(int postId);
}