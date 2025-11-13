using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface IPostRepository
{
    Task<IEnumerable<Post>> GetAllAsync();
    Task<Post?> GetByIdAsync(int postId);
    Task<IEnumerable<Post>> GetByUserIdAsync(int userId);
    Task<IEnumerable<Post>> GetByTagAsync(string tagName);
    Task<Post> CreateAsync(Post post);
    Task<Post?> UpdateAsync(Post post);
    Task<bool> DeleteAsync(int postId);
    Task<bool> IncrementLikesAsync(int postId);
    Task<bool> DecrementLikesAsync(int postId);
}