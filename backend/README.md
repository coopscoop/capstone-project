> [!NOTE]
> Might not be up to date, check the rest of the project just in case. This is a general outline as of the API working with linting/execution.

This project follows clean architecture (check out links below for more), here's the general project structure:
```
┌─────────────────────────────────────┐
│         API (Presentation)          │  ← User Interface
│    Controllers, HTTP, JSON          │
└──────────────┬──────────────────────┘
               ↓ depends on
┌──────────────────────────────────────┐
│  Application (Business Logic)        │  ← Use Cases
│     Services, Orchestration          │
└──────────┬───────────────────────────┘
           ↓ depends on
     ┌─────────────────────┐
     │   Core (Domain)     │              ← Pure Business Rules
     │  Models, Interfaces │              ← NO dependencies!
     └─────────────────────┘
           ↑ implements
┌──────────┴───────────────────────────┐
│  Infrastructure (External)           │  ← Technical Details
│   Database, Files, APIs, Python      │
└──────────────────────────────────────┘
```

The project is generally split up into 4 chunks. API, Application, Core and Infrastructure.
- API
  - What the user (the website) will be interacting with, my Controllers/API endpoint
- Application
  - What the controller's use, any the Lint and Execute services that are being run
- Core
  - Models and interfaces, the blocks framework of the rest of the program
- Infrastructure
  - Where my linter lives, As its written in python and simply has serial input/output, creating a service to interact with it is the cleanest option
  - Soon to be where my database lives(?)

## Adding content
Adding content is a lot of boilerplate, although It's relatively simple to add content/DB CRUD to the API

The general structure for adding content from a DB table is as follows:
1. Object model for the DB table (DTO's are derived from this)
2. A DTO for the API response
3. Interfaces for the repository and service
4. A repository that interacts with the DB
5. A service that the controller uses to interact with the repository (DB)
6. A controller for the API endpoints

Implementation wise it'd be in that order, but it's not crucial as they all need to be in for it to function.

### Object model - Core models
In [`Capstone.Core/Models/Domain`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.Core/Models/Domain)
The backend uses `Dapper` to interact with the DB, so the object model needs to be able to map to the DB table. The object model is created, then the SQL query return gets mapped to that object.

### DTO - Core models
In [`Capstone.Core/Models/DTOs`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.Core/Models/Dtos)

The DTO is used to map the object model to the API response. In the backend we use the full object model, but because that's got more information than we need or can contain sensitive information, we create a DTO that only contains the information we need for any API response.

> i.e. The `User` object contains  `UserId`, `Email`, `Password`, `IsAdmin`, `DisplayName`, `Bio` and `TimeCreated`, although the `UserDto` doesn't contain the `Password`. The `Password` is considered sensitive information and should not be returned to the user with any responses, so it's not included in the DTO.

### Interfaces - Core
In [`Capstone.Core/Interfaces`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.Core/Interfaces)

The interfaces are used to define the contract for the repository and service. The interfaces are primarily there just for the sake of documentation, but also to make it more difficult to miss any implementation details.

### Repository - Infrastructure/Database
In [`Capstone.Infrastructure/Persistence/Repositories`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.Infrastructure/Persistence/Repositories)

The repository is where the actual interaction with the DB happens. It's responsible for creating, updating, deleting and querying information from the DB. The repository is also responsible for mapping the DB table to the object model.

For example, here's my `User` object model, and the `GetAllAsync()` method in the repository:
```csharp
public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public string? DisplayName { get; set; }
    public string? Bio { get; set; }
    public DateTime TimeCreated { get; set; }
}
```
```csharp
public async Task<IEnumerable<User>> GetAllAsync()
{
    const string sql = @"
        SELECT 
            user_id AS UserId,
            email AS Email,
            password AS Password,
            is_admin AS IsAdmin,
            display_name AS DisplayName,
            bio AS Bio,
            time_created AS TimeCreated
        FROM users
        ORDER BY time_created DESC";

    await using var connection = _dbConnection.CreateConnection();
    return await connection.QueryAsync<User>(sql);
}
```
Using my `GetAllAsync()` method as an example for one of the methods in the repository, its implementation is pretty straight forward. The key thing with the queries is to alias the columns to the object model, this is how Dapper knows what to map the query to.

### Service - Application/Business Logic
In [`Capstone.Application/Services`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.Application/Services)

The service is what the controller uses to interact with the repository. It's responsible for any business logic, such as validating the data, checking if the user exists, etc. This uses the repository to interact with the DB.

### Controller - API/Presentation
In [`Capstone.API/Controllers`](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/tree/main/backend/Capstone.API/Controllers)

The controller is where the API endpoints are defined. It's responsible for handling the incoming requests and passing them to the service to be handled.

## Resources I've used/found useful
### Structure
- https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
  - I didn't like how the project was structured, found this and decided to redo the entire backend properly
- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
  - More stuff for how I structured this

### Python Linter
- https://docs.python.org/3/library/ast.html#abstract-grammar
  - Docs for how to use the python AST
- https://www.youtube.com/live/qU3Rc6_B9es
  - For the linter/python aspect of the backend type structure

### ASP.NET
- https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-8.0
  - Primarily the **HTTP API apps** and **ASP.NET Core video tutorials** blocks
  - It's not perfect but its small enough to where just one worker having the lint/exec and my endpoints
- https://learn.microsoft.com/en-us/dotnet/core/diagnostics/
  - Generally used, started off with logging
- https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo?view=net-8.0
  - How to start/work with a service. Created a handler for both the Linter and Code Execution aspects.
- https://github.com/DapperLib/Dapper
  - Using Dapper for the ORM as I write the SQL queries compared to EF Core library
- https://github.com/jstedfast/MailKit
  - As SmtpClient is depreciated
- https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-9.0
  - For user Auth
- https://github.com/BcryptNet/bcrypt.net
  - Using Bcrype.net to hash passwords, easier than the built in .net implementation of hashing
### Tests - still .NET
- [xUnit](https://xunit.net/?tabs=cs)
  - Testing suite for .NET
  - Simple structure for writing tests
  - Strong logging for output/errors
- [Moq](https://github.com/devlooped/moq)
  - Creates a mock object for testing
  - Used to create a mock of the linter/executor service for testing, this is why the non-integration tests can be run without the API being up
  - https://www.youtube.com/watch?v=9ZvDBSQa_so
    - Beginning to end shows how to use it
- [FluentAssertions](https://github.com/fluentassertions/fluentassertions)
  - Used to make assertions on the results of the linter/executor service - just QOL for the tests
  - https://www.youtube.com/watch?v=b2zxl5zNjlA
    - Video on how to use it
  - Free for non-commercial uses past v.8
    - Still don't know how it's legal to just swap the lisence out from Apache to whatever Xceed decided to use on an open source community project
    - Might swap over to [shouldly](https://github.com/shouldly/shouldly) in the future as its FluentAssertions-like but not with out of touch licenses
