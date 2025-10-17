> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large
>
> As of October 14th I've decided to just start over on the backend with better practice. It's simply not scalable and or set up properly.

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python.

## Setup (subject to change)

-   Backend: `cd Backend.API && dotnet run` (creates a /swagger page to test the API), `dotnet build` to build the project 
-   implement the frontend
-   implement the test cases too (use XUnit?)

> [!NOTE]
> both the `Frontend` and `Tests` are currently not implemented, will update here once they're implemented.

## The general structure goes as follows 
(auto generated, not finalized will change slightly)

```
PythonRepl/
├── PythonRepl.sln                      # Solution file
│
├── PythonRepl.Core/                    # Domain layer (no dependencies)
│   ├── Models/
│   │   ├── CodeExecutionRequest.cs     # Request to execute code
│   │   ├── CodeExecutionResult.cs      # Execution response
│   │   ├── LintRequest.cs              # Request to lint code
│   │   ├── LintResult.cs               # Linting response
│   │   └── LintIssue.cs                # Individual lint issue
│   └── Interfaces/
│       ├── ICodeExecutionService.cs    # Service contract for execution
│       ├── ILinterService.cs           # Service contract for linting
│       └── IPythonProcessManager.cs    # Process manager contract
│
├── PythonRepl.Application/             # Business logic layer
│   └── Services/
│       ├── CodeExecutionService.cs     # Orchestrates execution + linting
│       └── LinterService.cs            # Handles linting requests
│
├── PythonRepl.Infrastructure/          # External dependencies layer
│   └── Python/
│       └── PythonProcessManager.cs     # Manages Python worker process
│
├── PythonRepl.API/                     # API/Presentation layer
│   ├── Controllers/
│   │   └── CodeController.cs           # REST endpoints
│   ├── Program.cs                      # Startup configuration
│   ├── appsettings.json                # Configuration
│   └── appsettings.Development.json    # Dev configuration
│
└── Python/                             # Python worker process
    ├── python_worker.py                # Main worker script - reads json -> run rules -> return json result
    ├── linter.py                       # Linter orchestrator
    └── rules/                          # All the rules, keeps it easy to extend
        ├── __init__.py                 # Rules registry
        ├── base_rule.py                # Base class for all rules
        └── {all the rules}.py          # Any of the rules I create
```

## Communicaiton flow
1. React Frontend
    - creates the post requests with the code
    - creates the get requests for any content
2. API Controller
    - ASP.NET controllers for the API endpoints
3. CodeExecutionService
    - Service for the Linter/Execution manager
4. PythonProcessManager
    - The manager for the linter/execution aspect of the backend
5. Linter
    - Runs the rules and returns the result

## Resources I've used/found useful
- https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0
    - Primarily the **HTTP API apps** and **ASP.NET Core video tutorials** blocks
- https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
    - I didn't like how the project was structured, found this and decided to just make the swap
- https://docs.python.org/3/library/ast.html#abstract-grammar
    - Docs for how to use the python AST
- https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
    - More stuff for how I structured this
- https://www.youtube.com/live/qU3Rc6_B9es
    - For the linter/python aspect of the backend type structure
    - It's not perfect but its small enough to where just one worker having the lint/exec and my endpoints

## ORM stuff to show the prof
- https://github.com/DapperLib/Dapper
- https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/retrieving-data-using-a-datareader
- https://learn.microsoft.com/en-us/ef/core/querying/
