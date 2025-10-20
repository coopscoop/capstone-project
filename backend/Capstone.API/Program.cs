using Capstone.Application.Services;
using Capstone.Core.Interfaces;
using Capstone.Infrastructure;

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

// Register application services
builder.Services.AddSingleton<IPythonProcessManager, PythonProcessManager>();
builder.Services.AddScoped<ICodeExecutionService, CodeExecutionService>();
builder.Services.AddScoped<ILinterService, LinterService>();

// CORS configuration for React frontend, used in middleware (eventually, will probably need to change)
// NOTE: currently using http, should be changed to https later
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .WithOrigins(
                "http://localhost:3000")  // React front end
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