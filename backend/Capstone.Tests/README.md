# Testing Guide for Capstone API

This guide explains how to use the test suite for your JWT-authenticated API.

## Test Structure

The test suite includes two types of tests:

### 1. **Unit Tests** (Fast, Isolated)
- Test controller logic without hitting the database
- Mock all service dependencies
- Run instantly, great for TDD
- Located in: `Capstone.Tests.Unit.Controllers`

### 2. **Integration Tests** (Real API, Test Auth)
- Test full HTTP request/response cycle
- Use real controllers and middleware
- Replace JWT auth with test authentication
- Located in: `Capstone.Tests.Integration`

## Setup

### Required NuGet Packages

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
  <PackageReference Include="xunit" Version="2.6.2" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
  <PackageReference Include="Moq" Version="4.20.70" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
</ItemGroup>
```

### Project Structure

```
Capstone.Tests/
├── Unit/
│   └── Controllers/
│       └── AuthControllerTests.cs
├── Integration/
│   ├── Helpers/
│   │   ├── TestAuthHandler.cs
│   │   └── CustomWebApplicationFactory.cs
│   ├── PostsControllerIntegrationTests.cs
│   ├── UserControllerIntegrationTests.cs
│   ├── FavouriteControllerIntegrationTests.cs
│   ├── CodeControllerIntegrationTests.cs
│   └── TagAndPasswordResetControllerTests.cs
└── TESTING_README.md
```

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Only Unit Tests
```bash
dotnet test --filter "FullyQualifiedName~Unit"
```

### Run Only Integration Tests
```bash
dotnet test --filter "FullyQualifiedName~Integration"
```

### Run Tests for Specific Controller
```bash
dotnet test --filter "FullyQualifiedName~PostsController"
```

### Run with Detailed Output
```bash
dotnet test --logger "console;verbosity=detailed"
```

## How Authentication Works in Tests

### The Test Authentication Handler

The `TestAuthHandler` replaces JWT authentication with a simple claim-based auth that bypasses token validation. This allows you to test as different users without generating real JWTs.

### Creating Test Clients

```csharp
// Regular user (userId = 1, Role = "User")
var client = _factory.CreateRegularUserClient();

// Regular user with specific ID
var client = _factory.CreateRegularUserClient(userId: 42);

// Admin user (userId = 999, Role = "Admin")
var client = _factory.CreateAdminClient();

// Unauthenticated user (no claims)
var client = _factory.CreateUnauthenticatedClient();

// Custom claims
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, "123"),
    new Claim(ClaimTypes.Role, "Admin")
};
var client = _factory.CreateAuthenticatedClient(claims);
```

## Writing New Tests

### Unit Test Example

```csharp
[Fact]
public async Task YourMethod_ValidInput_ReturnsExpectedResult()
{
    // Arrange
    var mockService = new Mock<IYourService>();
    mockService.Setup(x => x.YourMethod(It.IsAny<Input>()))
               .ReturnsAsync(expectedResult);
    
    var controller = new YourController(mockService.Object);
    
    // Act
    var result = await controller.YourMethod(input);
    
    // Assert
    result.Result.Should().BeOfType<OkObjectResult>();
}
```

### Integration Test Example

```csharp
[Fact]
public async Task YourEndpoint_AsRegularUser_ReturnsOk()
{
    // Arrange
    var client = _factory.CreateRegularUserClient();
    var requestData = new YourDto { /* ... */ };
    
    // Act
    var response = await client.PostAsJsonAsync("/api/your-endpoint", requestData);
    
    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var result = await response.Content.ReadFromJsonAsync<YourResponseDto>();
    result.Should().NotBeNull();
    result.Property.Should().Be(expectedValue);
}
```

## Testing Different Authorization Scenarios

### Test Unauthorized Access
```csharp
[Fact]
public async Task ProtectedEndpoint_AsUnauthenticated_ReturnsUnauthorized()
{
    var client = _factory.CreateUnauthenticatedClient();
    var response = await client.GetAsync("/api/protected");
    response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
}
```

### Test Forbidden Access (Wrong Role)
```csharp
[Fact]
public async Task AdminEndpoint_AsRegularUser_ReturnsForbidden()
{
    var client = _factory.CreateRegularUserClient();
    var response = await client.GetAsync("/api/admin-only");
    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

### Test Ownership (User Can Only Edit Their Own Data)
```csharp
[Fact]
public async Task UpdatePost_OtherUsersPost_ReturnsForbidden()
{
    var client = _factory.CreateRegularUserClient(userId: 2);
    var postId = 1; // Owned by user 1
    
    var response = await client.PutAsJsonAsync($"/api/posts/{postId}", updateData);
    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

## Common Patterns

### Testing Multiple Status Codes

When your endpoint might return different valid responses depending on database state:

```csharp
response.StatusCode.Should().BeOneOf(
    HttpStatusCode.OK, 
    HttpStatusCode.NotFound
);
```

### Testing Error Responses

```csharp
[Fact]
public async Task BadRequest_ReturnsErrorMessage()
{
    var client = _factory.CreateRegularUserClient();
    var invalidRequest = new Request { /* invalid data */ };
    
    var response = await client.PostAsJsonAsync("/api/endpoint", invalidRequest);
    
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    var content = await response.Content.ReadAsStringAsync();
    content.Should().Contain("expected error message");
}
```

## Troubleshooting

### Tests Fail with "Program does not exist"

Make sure your `Program.cs` is accessible to the test project:

```csharp
// Add to the end of Program.cs
public partial class Program { }
```

### Authentication Not Working

Ensure `CustomWebApplicationFactory` is properly configured and `TestAuthHandler` is registered in test services.

### Database-Dependent Tests Failing

Integration tests may fail if:
- Database is not accessible
- Data doesn't exist
- Services throw exceptions

Use `.Should().BeOneOf()` for endpoints that depend on data existence.

## Best Practices

1. **Keep unit tests fast** - Mock all external dependencies
2. **Make integration tests resilient** - Handle multiple valid outcomes
3. **Test authorization thoroughly** - Every protected endpoint should have auth tests
4. **Use descriptive test names** - Method_Scenario_ExpectedBehavior
5. **Test edge cases** - Empty strings, nulls, invalid IDs
6. **Test error paths** - Not just the happy path
7. **Don't test the framework** - Focus on your business logic

## CI/CD Integration

Add to your pipeline:

```yaml
- name: Run Tests
  run: dotnet test --configuration Release --logger trx --results-directory TestResults
  
- name: Publish Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: TestResults
```

## Need More Help?

- Check existing tests for examples
- Review FluentAssertions documentation: https://fluentassertions.com/
- Review xUnit documentation: https://xunit.net/
- Review Moq documentation: https://github.com/moq/moq4
