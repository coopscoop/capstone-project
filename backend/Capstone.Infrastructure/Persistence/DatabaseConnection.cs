namespace Capstone.Infrastructure.Persistence;

using Npgsql;
using Microsoft.Extensions.Configuration;

/// <summary>
/// Helper for creating database connections
/// </summary>
public class DatabaseConnection
{
    private readonly string _connectionString;

    public DatabaseConnection(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string not configured");
    }

    public NpgsqlConnection CreateConnection()
    {
        return new NpgsqlConnection(_connectionString);
    }
}