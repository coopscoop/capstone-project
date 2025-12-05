using System.Text;
using Capstone.Application.Services;
using Capstone.Application.BackgroundServices;
using Capstone.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Capstone.Core.Models.Configuration;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;

// many imports but makes the middleware instancing easier to read
using Capstone.Infrastructure;
using Capstone.Infrastructure.Persistence;
using Capstone.Infrastructure.Persistence.Repositories;

using Capstone.API.Logging;

var builder = WebApplication.CreateBuilder(args);

// Build connection string from environment variables
// For production: base connection string + password from Secret Manager
// For local dev: full connection string from appsettings.json
var connStringBase = builder.Configuration.GetConnectionString("DefaultConnection");
var dbPassword = builder.Configuration["ConnectionStrings:Password"];

if (!string.IsNullOrEmpty(dbPassword))
{
    // Production: append password from Secret Manager
    builder.Configuration["ConnectionStrings:DefaultConnection"] = $"{connStringBase};Password={dbPassword}";
}

// CORS configuration for React frontend, used in middleware
var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins(
                "http://localhost:3000",
                frontendUrl
            )  // react front end
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Python REPL API",
        Version = "v1",
        Description = "API for executing and linting Python code"
    });
});
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// configure JWT auth
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();
if (jwtSettings == null || string.IsNullOrEmpty(jwtSettings.Key))
{
    throw new InvalidOperationException("JWT settings are not properly configured");
}

var key = Encoding.UTF8.GetBytes(jwtSettings.Key);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role
    };
});

// Configure logging to be easier to read
// builder.Logging.ClearProviders();
builder.Logging.AddConsole(options =>
{
    options.FormatterName = "custom";
});

builder.Logging.AddConsoleFormatter<CustomConsoleFormatter, ConsoleFormatterOptions>();

// Authorization
builder.Services.AddAuthorization();

// Email settings
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));

// linter/execution services
builder.Services.AddSingleton<IPythonProcessManager, PythonProcessManager>();
builder.Services.AddScoped<ICodeExecutionService, CodeExecutionService>();
builder.Services.AddScoped<ILinterService, LinterService>();

// Dapper type handlers - needed to get the array of tags to work
DapperTypeHandlers.RegisterHandlers();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IFavouriteRepository, FavouriteRepository>();
builder.Services.AddScoped<IPasswordResetRepository, PasswordResetRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IFavouriteService, FavouriteService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUserContextService, UserContextService>();

// Http context accessor - used in services
builder.Services.AddHttpContextAccessor();

// Background services
builder.Services.AddHostedService<ResetTokenCleanupService>();
builder.Services.AddHostedService<JwtTokenCleanupService>();

// db connection
builder.Services.AddSingleton<DatabaseConnection>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Python REPL API v1");
        c.RoutePrefix = "swagger";
    });
}

// Middleware
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Initialize Python process on startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Initializing Python worker process...");

// Try to initialize the Python process
try
{
    var pythonManager = app.Services.GetRequiredService<IPythonProcessManager>();
    await pythonManager.InitializeAsync();
    logger.LogInformation("Python worker process initialized successfully");
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to initialize Python worker process");
    throw;
}

// Graceful shutdown
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(async () =>
{
    logger.LogInformation("Application shutting down...");
    var pythonManager = app.Services.GetRequiredService<IPythonProcessManager>();
    await pythonManager.ShutdownAsync();
});

// Start the application
logger.LogInformation("API is ready to accept requests");
app.Run();