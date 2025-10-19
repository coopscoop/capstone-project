// ===== CapstoneAPI/Program.cs =====
using CapstoneAPI.Core.Interfaces;
using CapstoneAPI.Application.Services;
using CapstoneAPI.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
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

// Register application services
builder.Services.AddSingleton<IPythonProcessManager, PythonProcessManager>();
builder.Services.AddScoped<ICodeExecutionService, CodeExecutionService>();
builder.Services.AddScoped<ILinterService, LinterService>();

// CORS configuration for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins(
                "http://localhost:3000",  // Create React App
                "http://localhost:5173")  // Vite
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

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Initialize Python process on startup
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Initializing Python worker process...");

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

logger.LogInformation("API is ready to accept requests");
app.Run();