using CapstoneBackend.Models;
using CapstoneBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<LinterService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/lint", (LinterService linter, CodeRequest request) =>
{
    var results = linter.Lint(request.Code);
    return Results.Json(results);
})
.WithName("LintCode");

app.Run();
