namespace Capstone.Tests.Services;

using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Capstone.Application.Services;
using Capstone.Core.Interfaces;
using Capstone.Core.Models;
using System.Text.Json;

public class LinterServiceTests
{
    private readonly Mock<IPythonProcessManager> _mockPythonManager;
    private readonly Mock<ILogger<LinterService>> _mockLogger;
    private readonly LinterService _LinterService; // System Under Test

    public LinterServiceTests()
    {
        _mockPythonManager = new Mock<IPythonProcessManager>();
        _mockLogger = new Mock<ILogger<LinterService>>();
        _LinterService = new LinterService(_mockPythonManager.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task LintCodeAsync_ValidCode_ReturnsNoIssues()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def calculate_sum(numbers):\n    return sum(numbers)"
        };

        var pythonResponse = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>()
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue();
        // has warnings but no errors
    }

    [Fact]
    public async Task LintCodeAsync_InvalidNaming_ReturnsWarning()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def MyBadFunction():\n    pass"
        };

        var pythonResponse = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>
            {
                new LintIssue
                {
                    Severity = "warning",
                    Message = "Function 'MyBadFunction' should use snake_case naming convention",
                    Line = 1,
                    Column = 0,
                    RuleId = "naming-convention"
                }
            }
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeTrue(); // Warnings don't make it invalid
        result.Issues.Should().HaveCount(1);
        result.Issues[0].Severity.Should().Be("warning");
        result.Issues[0].RuleId.Should().Be("naming-convention");
    }

    [Fact]
    public async Task LintCodeAsync_SyntaxError_ReturnsError()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def broken_function(\n    print('missing closing paren')"
        };

        var pythonResponse = new LintResult
        {
            IsValid = false,
            Issues = new List<LintIssue>
            {
                new LintIssue
                {
                    Severity = "error",
                    Message = "Syntax error: invalid syntax",
                    Line = 1,
                    Column = 20,
                    RuleId = "syntax-error"
                }
            }
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeFalse();
        result.Issues.Should().HaveCount(1);
        result.Issues[0].Severity.Should().Be("error");
    }

    [Fact]
    public async Task LintCodeAsync_EmptyCode_StillCallsPython()
    {
        // Arrange
        var request = new LintRequest { Code = "" };

        var pythonResponse = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>()
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        _mockPythonManager.Verify(
            x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task LintCodeAsync_PythonProcessThrows_ReturnsErrorResult()
    {
        // Arrange
        var request = new LintRequest { Code = "def test(): pass" };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Python process crashed"));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.IsValid.Should().BeFalse();
        result.Issues.Should().HaveCount(1);
        result.Issues[0].Severity.Should().Be("error");
        result.Issues[0].RuleId.Should().Be("internal-error");
    }

    [Fact]
    public async Task LintCodeAsync_WithSpecificRules_PassesRulesToPython()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def test(): pass",
            EnabledRules = new List<string?> { "naming-convention", "missing-docstring" }
        };

        var pythonResponse = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>()
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        await _LinterService.LintCodeAsync(request);

        // Assert
        // different format to capture the argument outside of the expression tree - throws error otherwise
        var commandCapture = new List<object>();

        _mockPythonManager.Verify(
            x => x.SendCommandAsync(
                Capture.In(commandCapture),
                It.IsAny<CancellationToken>()),
            Times.Once);

        var serializedCommand = JsonSerializer.Serialize(commandCapture.First());
        Assert.Contains("naming-convention", serializedCommand);
    }

    [Fact]
    public async Task LintCodeAsync_MultipleIssues_ReturnsAllIssues()
    {
        // Arrange
        var request = new LintRequest
        {
            Code = "def MyFunction():\n    x = 10\n    print('test')"
        };

        var pythonResponse = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>
            {
                new LintIssue
                {
                    Severity = "warning",
                    Message = "Function 'MyFunction' should use snake_case",
                    Line = 1,
                    Column = 0,
                    RuleId = "naming-convention"
                },
                new LintIssue
                {
                    Severity = "warning",
                    Message = "Variable 'x' is assigned but never used",
                    Line = 2,
                    Column = 4,
                    RuleId = "unused-variable"
                },
                new LintIssue
                {
                    Severity = "info",
                    Message = "Consider using logging instead of print",
                    Line = 3,
                    Column = 4,
                    RuleId = "use-logging"
                }
            }
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _LinterService.LintCodeAsync(request);

        // Assert
        result.Issues.Should().HaveCount(3);
        result.Issues.Should().Contain(i => i.RuleId == "naming-convention");
        result.Issues.Should().Contain(i => i.RuleId == "unused-variable");
        result.Issues.Should().Contain(i => i.RuleId == "use-logging");
    }
}