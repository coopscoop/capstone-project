namespace Capstone.Tests.Integration;

using Xunit;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using Capstone.Core.Models;

/// <summary>
/// Integration tests that require the API to be running
/// Run these manually with: dotnet test --filter Category=Integration
/// Make sure API is running first: dotnet run --project Capstone.API
/// </summary>
public class LinterExecIntegrationTests : IDisposable
{
    private readonly HttpClient _client;
    private const string BaseUrl = "http://localhost:5225";

    public LinterExecIntegrationTests()
    {
        // Skip SSL validation for local testing
        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
        };
        _client = new HttpClient(handler)
        {
            BaseAddress = new Uri(BaseUrl)
        };
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Health_ReturnsHealthy()
    {
        // Act
        var response = await _client.GetAsync("/code/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("healthy");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Lint_ValidCode_ReturnsNoIssues()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def calculate_sum(numbers):\n    \"\"\"Calculate sum.\"\"\"\n    return sum(numbers)\n    calculate_sum([1, 2, 3])"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/code/lint", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LintResult>();
        result.Should().NotBeNull();
        result!.IsValid.Should().BeTrue();
        result.Issues.Should().BeEmpty();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Lint_BadNaming_ReturnsWarning()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def MyBadFunction():\n    pass"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/code/lint", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<LintResult>();
        result.Should().NotBeNull();
        result!.Issues.Should().HaveCountGreaterThan(0);
        result.Issues.Should().Contain(i => i.RuleId == "naming-convention");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_PrintStatement_ReturnsOutput()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('Hello from integration test!')",
            RunLinter = false,
            TimeoutSeconds = 5
        };

        // Act
        var response = await _client.PostAsJsonAsync("/code/execute", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Output.Should().Contain("Hello from integration test!");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_WithError_ReturnsFailure()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print(undefined_variable)",
            RunLinter = false
        };

        // Act
        var response = await _client.PostAsJsonAsync("/code/execute", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();
        result.Should().NotBeNull();
        result!.Success.Should().BeFalse();
        result.Error.Should().Contain("NameError");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_WithLinting_ReturnsBoth()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "def MyFunction():\n    print('test')\nprint('test2')",
            RunLinter = true
        };

        // Act
        var response = await _client.PostAsJsonAsync("/code/execute", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<CodeExecutionResult>();
        result.Should().NotBeNull();
        result!.Success.Should().BeTrue();
        result.Output.Should().Contain("test2");
        result.LintIssues.Should().Contain(i => i.RuleId == "naming-convention");
        result.LintIssues.Should().Contain(i => i.RuleId == "unused-function");
        result.LintIssues.Should().Contain(i => i.RuleId == "missing-docstring");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Lint_EmptyCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new LintRequest { Code = "" };

        // Act
        var response = await _client.PostAsJsonAsync("/code/lint", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Execute_EmptyCode_ReturnsBadRequest()
    {
        // Arrange
        var request = new CodeExecutionRequest { Code = "" };

        // Act
        var response = await _client.PostAsJsonAsync("/code/execute", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    public void Dispose()
    {
        _client?.Dispose();
    }
}