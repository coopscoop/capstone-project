using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IPostRepository
{
    Task<IEnumerable<Post>> GetAllAsync(int? currentUserId = null, bool? isAdmin = null);
    Task<Post?> GetByIdAsync(int postId, int? currentUserId = null, bool? isAdmin = null);
    Task<IEnumerable<Post>> GetByUserIdAsync(int userId, int? currentUserId = null, bool? isAdmin = null);
    Task<IEnumerable<Post>> GetByTagAsync(string tagName, int? currentUserId = null, bool? isAdmin = null);
    Task<Post> CreateAsync(Post post);
    Task<bool> UpdateAsync(Post post);
    Task<bool> DeleteAsync(int postId);
    Task<bool> IncrementLikesAsync(int postId);
    Task<bool> DecrementLikesAsync(int postId);
}