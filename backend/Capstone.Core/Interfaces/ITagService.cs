using Capstone.Core.Models.Dtos;

namespace Capstone.Core.Interfaces;

public interface ITagService
{
    Task<IEnumerable<TagDto>> GetByPostIdAsync(int postId);
    Task<IEnumerable<string>> GetAllUniqueTagsAsync();
    Task<TagDto> AddTagToPostAsync(int postId, string tagName);
    Task<bool> RemoveTagFromPostAsync(int postId, string tagName);
    Task<bool> RemoveAllTagsFromPostAsync(int postId);
}