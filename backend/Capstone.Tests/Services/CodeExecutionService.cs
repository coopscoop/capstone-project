namespace Capstone.Tests.Services;

using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Capstone.Application.Services;
using Capstone.Core.Interfaces;
using Capstone.Core.Models;
using System.Text.Json;

public class CodeExecutionServiceTests
{
    private readonly Mock<IPythonProcessManager> _mockPythonManager;
    private readonly Mock<ILinterService> _mockLinterService;
    private readonly Mock<ILogger<CodeExecutionService>> _mockLogger;
    private readonly CodeExecutionService _sut;

    public CodeExecutionServiceTests()
    {
        _mockPythonManager = new Mock<IPythonProcessManager>();
        _mockLinterService = new Mock<ILinterService>();
        _mockLogger = new Mock<ILogger<CodeExecutionService>>();
        _sut = new CodeExecutionService(
            _mockPythonManager.Object,
            _mockLinterService.Object,
            _mockLogger.Object);
    }

    [Fact]
    public async Task ExecuteCodeAsync_SimpleCode_ReturnsSuccessWithOutput()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('Hello, World!')",
            RunLinter = false,
            TimeoutSeconds = 5
        };

        var pythonResponse = new
        {
            success = true,
            output = "Hello, World!\n",
            error = ""
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Output.Should().Be("Hello, World!\n");
        result.Error.Should().BeEmpty();
    }

    [Fact]
    public async Task ExecuteCodeAsync_WithLinting_RunsLinterFirst()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "def test(): pass",
            RunLinter = true,
            TimeoutSeconds = 5
        };

        var lintResult = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>()
        };

        var pythonResponse = new
        {
            success = true,
            output = "",
            error = ""
        };

        _mockLinterService
            .Setup(x => x.LintCodeAsync(It.IsAny<LintRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(lintResult);

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        _mockLinterService.Verify(
            x => x.LintCodeAsync(It.IsAny<LintRequest>(), It.IsAny<CancellationToken>()),
            Times.Once);
        result.LintIssues.Should().BeEmpty();
    }

    [Fact]
    public async Task ExecuteCodeAsync_WithoutLinting_SkipsLinter()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('test')",
            RunLinter = false
        };

        var pythonResponse = new
        {
            success = true,
            output = "test\n",
            error = ""
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        _mockLinterService.Verify(
            x => x.LintCodeAsync(It.IsAny<LintRequest>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task ExecuteCodeAsync_CodeWithError_ReturnsFailureWithError()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print(undefined_variable)",
            RunLinter = false
        };

        var pythonResponse = new
        {
            success = false,
            output = "",
            error = "NameError: name 'undefined_variable' is not defined\n"
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Error.Should().Contain("NameError");
        result.Error.Should().Contain("undefined_variable");
    }

    [Fact]
    public async Task ExecuteCodeAsync_Loop_ReturnsMultipleLines()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "for i in range(3):\n    print(f'Number: {i}')",
            RunLinter = false
        };

        var pythonResponse = new
        {
            success = true,
            output = "Number: 0\nNumber: 1\nNumber: 2\n",
            error = ""
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.Output.Should().Contain("Number: 0");
        result.Output.Should().Contain("Number: 1");
        result.Output.Should().Contain("Number: 2");
    }

    [Fact]
    public async Task ExecuteCodeAsync_PythonProcessFails_ReturnsErrorResult()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('test')",
            RunLinter = false
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Python process crashed"));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.Success.Should().BeFalse();
        result.Error.Should().Contain("Execution failed");
    }

    [Fact]
    public async Task ExecuteCodeAsync_TracksExecutionTime()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('test')",
            RunLinter = false
        };

        var pythonResponse = new
        {
            success = true,
            output = "test\n",
            error = ""
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.ExecutionTimeMs.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public async Task ExecuteCodeAsync_WithLintErrors_StillExecutes()
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "def MyFunction(): print('bad naming but works')",
            RunLinter = true
        };

        var lintResult = new LintResult
        {
            IsValid = true,
            Issues = new List<LintIssue>
            {
                new LintIssue
                {
                    Severity = "warning",
                    Message = "Bad naming",
                    Line = 1,
                    Column = 0,
                    RuleId = "naming-convention"
                }
            }
        };

        var pythonResponse = new
        {
            success = true,
            output = "bad naming but works\n",
            error = ""
        };

        _mockLinterService
            .Setup(x => x.LintCodeAsync(It.IsAny<LintRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(lintResult);

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        var result = await _sut.ExecuteCodeAsync(request);

        // Assert
        result.Success.Should().BeTrue();
        result.LintIssues.Should().HaveCount(1);
        result.Output.Should().Contain("bad naming but works");
    }

    [Theory]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(30)]
    public async Task ExecuteCodeAsync_CustomTimeout_PassesToPython(int timeoutSeconds)
    {
        // Arrange
        var request = new CodeExecutionRequest
        {
            Code = "print('test')",
            RunLinter = false,
            TimeoutSeconds = timeoutSeconds
        };

        var pythonResponse = new
        {
            success = true,
            output = "test\n",
            error = ""
        };

        _mockPythonManager
            .Setup(x => x.SendCommandAsync(It.IsAny<object>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(JsonSerializer.Serialize(pythonResponse));

        // Act
        await _sut.ExecuteCodeAsync(request);

        // Assert - same weird format as in the Linter test, capturing the command object sent to Python process manager
        // can't use the argument directly because it's of type object, need to serialize to check contents before hand
        var commandCapture = new List<object>();

        _mockPythonManager.Verify(
            x => x.SendCommandAsync(
                Capture.In(commandCapture),
                It.IsAny<CancellationToken>()),
            Times.Once);

        var serializedCommand = JsonSerializer.Serialize(commandCapture.First());
        Assert.Contains($"\"timeout\":{timeoutSeconds}", serializedCommand);
    }
}