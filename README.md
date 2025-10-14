> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large
>
> As of October 14th I've decided to just start over on the backend with better practice. It's simply not scalable and or set up properly.

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python.

## Setup (subject to change)

-   Backend: cd backend && dotnet run (http://localhost:5000)
-   Frontend: cd frontend && npm start (http://localhost:3000)
-   Tests: cd tests && dotnet test

## The general structure goes as follows (subject to change, currently only implements the backend)

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
    ├── python_worker.py                # Main worker script
    ├── linter.py                       # Linter orchestrator
    └── rules/                          # All the rules, keeps it modular/easy to extend
        ├── __init__.py                 # Rules registry
        ├── base_rule.py                # Base class for all rules
        └── {all the rules}.py          # Any of the rules I create
```

## Resources I've used/found useful
- https://learn.microsoft.com/en-us/aspnet/core/?view=aspnetcore-9.0
    - primarily the **HTTP API apps** and **ASP.NET Core video tutorials** blocks
- https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
    - I didn't like how the project was structured, found this and decided to just make the swap
- https://docs.python.org/3/library/ast.html#abstract-grammar
    - docs for how to use the python AST