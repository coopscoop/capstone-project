using System.Text;
using Capstone.Application.Services;
using Capstone.Application.BackgroundServices;
using Capstone.Core.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Capstone.Core.Models.Configuration;
using System.Security.Claims;
using Microsoft.Extensions.Hosting;

// many imports but makes the middleware instancing easier to read
using Capstone.Infrastructure;
using Capstone.Infrastructure.Persistence;
using Capstone.Infrastructure.Persistence.Repositories;


var builder = WebApplication.CreateBuilder(args);

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
var key = Encoding.UTF8.GetBytes(jwtSettings!.Key);

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

builder.Services.AddAuthorization();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));

// linter/execution services
builder.Services.AddSingleton<IPythonProcessManager, PythonProcessManager>();
builder.Services.AddScoped<ICodeExecutionService, CodeExecutionService>();
builder.Services.AddScoped<ILinterService, LinterService>();

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

// Background services
builder.Services.AddHostedService<ResetTokenCleanupService>();
builder.Services.AddHostedService<JwtTokenCleanupService>();

// db connection
builder.Services.AddSingleton<DatabaseConnection>();

// CORS configuration for React frontend, used in middleware (eventually, will probably need to change)
// NOTE: currently using http, should be changed to https later
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins(
                "http://localhost:5173")  // React front end
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

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
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
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