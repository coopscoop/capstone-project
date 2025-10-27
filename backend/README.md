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

### .NET
- https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-8.0
  - Primarily the **HTTP API apps** and **ASP.NET Core video tutorials** blocks
  - It's not perfect but its small enough to where just one worker having the lint/exec and my endpoints
- https://learn.microsoft.com/en-us/dotnet/core/diagnostics/
  - Generally used, started off with logging
- https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.processstartinfo?view=net-8.0
  - How to start/work with a service. Created a handler for both the Linter and Code Execution aspects.
- https://github.com/DapperLib/Dapper
  - Using Dapper for the ORM as I write the SQL queries compared to EF Core library

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