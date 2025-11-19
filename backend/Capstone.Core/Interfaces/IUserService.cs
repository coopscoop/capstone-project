namespace Capstone.Core.Interfaces;

using Capstone.Core.Models.Dtos;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(int userId);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> CreateAsync(CreateUserDto createDto);
    Task<UserDto?> UpdateAsync(int userId, UpdateUserDto updateDto);
    Task<bool> DeleteAsync(int userId);
}