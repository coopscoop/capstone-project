namespace Capstone.Core.Interfaces;

using Capstone.Core.Models.DTOs;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(Guid userId);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> CreateAsync(CreateUserDto createDto);
    Task<UserDto?> UpdateAsync(Guid userId, UpdateUserDto updateDto);
    Task<bool> DeleteAsync(Guid userId);
}