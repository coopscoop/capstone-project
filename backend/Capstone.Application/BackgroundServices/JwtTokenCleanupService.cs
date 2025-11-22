namespace Capstone.Application.BackgroundServices;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Capstone.Core.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

public class JwtTokenCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<JwtTokenCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(24); // Run once per day

    public JwtTokenCleanupService(
        IServiceProvider serviceProvider,
        ILogger<JwtTokenCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Token Cleanup Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupExpiredTokensAsync();
                await Task.Delay(_cleanupInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while cleaning up expired tokens");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Wait 5 min before retry
            }
        }

        _logger.LogInformation("Token Cleanup Service stopped");
    }

    private async Task CleanupExpiredTokensAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var refreshTokenRepository = scope.ServiceProvider.GetRequiredService<IRefreshTokenRepository>();

        var deletedCount = await refreshTokenRepository.DeleteExpiredAsync();
        
        if (deletedCount > 0)
        {
            _logger.LogInformation("Cleaned up {Count} expired refresh tokens", deletedCount);
        }
    }
}