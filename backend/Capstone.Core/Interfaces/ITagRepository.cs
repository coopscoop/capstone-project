using Capstone.Core.Models.Domain;

namespace Capstone.Core.Interfaces;

public interface ITagRepository
{
    Task<IEnumerable<Tag>> GetByPostIdAsync(int postId);
    Task<IEnumerable<Tag>> GetAllTagsAsync();
    Task<Tag> CreateAsync(Tag tag);
    Task<bool> DeleteAsync(int postId, string tagName);
    Task<bool> DeleteByPostIdAsync(int postId);
}