using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetAllAsync();
    Task<PostDto?> GetByIdAsync(int postId);
    Task<IEnumerable<PostDto>> GetByUserIdAsync(int userId);
    Task<IEnumerable<PostDto>> GetByTagAsync(string tagName);
    Task<PostDto> CreateAsync(PostDto postDto);
    Task<PostDto?> UpdateAsync(int postId, PostDto postDto);
    Task<bool> DeleteAsync(int postId);
}