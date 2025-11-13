namespace Capstone.Infrastructure.Persistence.Repositories;

using Dapper;
using Microsoft.Extensions.Logging;
using Capstone.Core.Interfaces;
using Capstone.Core.Models.Domain;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

/// <summary>
/// Password Reset repository implementation using Dapper
/// </summary>
public class PasswordResetRepository : IPasswordResetRepository
{
    private readonly DatabaseConnection _dbConnection;
    private readonly ILogger<PostRepository> _logger;

    public PasswordResetRepository(
        DatabaseConnection dbConnection,
        ILogger<PostRepository> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public Task<PasswordReset> CreateAsync(PasswordReset passwordReset)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteExpiredAsync(DateTime expirationTime)
    {
        throw new NotImplementedException();
    }

    public Task<PasswordReset?> GetByResetCodeAsync(string resetCode)
    {
        throw new NotImplementedException();
    }

    public Task<PasswordReset?> GetByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }
}