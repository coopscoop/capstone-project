> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large
>
> As of October 14th I've decided to just start over on the backend with better practice. It's simply not scalable and or set up properly.

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python with a custom made linter.

## Setup (subject to change)

-   Backend: `cd Backend.API && dotnet run` (creates a /swagger page to test the API), `dotnet build` to build the project 
-   implement the frontend
-   implement the test cases too (use XUnit?)

> [!NOTE]
> both the `Frontend` and `Tests` are currently not implemented, will update here once they're implemented.

## The general structure goes as follows 
The file tree is simplified, there's more files but these are the primary ones:
```
│   .gitignore
│   README.md

├───CapstoneAPI
│   │   appsettings.Development.json
│   │   appsettings.json
│   │   CapstoneAPI.csproj
│   │   CapstoneAPI.csproj.user
│   │   CapstoneAPI.http
│   │   CapstoneAPI.sln
│   │   Program.cs
│   ├───Controllers
│   │       CodeController.cs
│   ├───obj
│   │   │   CapstoneAPI.csproj.nuget.dgspec.json
│   │   │   CapstoneAPI.csproj.nuget.g.props
│   │   │   CapstoneAPI.csproj.nuget.g.targets
│   │   │   project.assets.json
│   │   │   project.nuget.cache
│   │   │
│   │   └───Debug
│   │       └───net8.0
│   │           │   .NETCoreApp,Version=v8.0.AssemblyAttributes.cs
│   │           │   apphost.exe
│   │           │   Capstone.4F1C2640.Up2Date
│   │           │   CapstoneAPI.AssemblyInfo.cs
│   │           │   CapstoneAPI.AssemblyInfoInputs.cache
│   │           │   CapstoneAPI.assets.cache
│   │           │   CapstoneAPI.csproj.AssemblyReference.cache
│   │           │   CapstoneAPI.csproj.BuildWithSkipAnalyzers
│   │           │   CapstoneAPI.csproj.CoreCompileInputs.cache
│   │           │   CapstoneAPI.csproj.FileListAbsolute.txt
│   │           │   CapstoneAPI.dll
│   │           │   CapstoneAPI.GeneratedMSBuildEditorConfig.editorconfig
│   │           │   CapstoneAPI.genruntimeconfig.cache
│   │           │   CapstoneAPI.GlobalUsings.g.cs
│   │           │   CapstoneAPI.MvcApplicationPartsAssemblyInfo.cache
│   │           │   CapstoneAPI.MvcApplicationPartsAssemblyInfo.cs
│   │           │   CapstoneAPI.pdb
│   │           │   CapstoneAPI.sourcelink.json
│   │           │   staticwebassets.build.json
│   │           │
│   │           ├───ref
│   │           │       CapstoneAPI.dll
│   │           │
│   │           ├───refint
│   │           │       CapstoneAPI.dll
│   │           │
│   │           └───staticwebassets
│   │                   msbuild.build.CapstoneAPI.props
│   │                   msbuild.buildMultiTargeting.CapstoneAPI.props
│   │                   msbuild.buildTransitive.CapstoneAPI.props
│   │
│   └───Properties
│           launchSettings.json
│
├───CapstoneAPI.Application
│   │   CapstoneAPI.Application.csproj
│   │
│   ├───bin
│   │   └───Debug
│   │       └───net8.0
│   │               CapstoneAPI.Application.deps.json
│   │               CapstoneAPI.Application.dll
│   │               CapstoneAPI.Application.pdb
│   │               CapstoneAPI.Core.dll
│   │               CapstoneAPI.Core.pdb
│   │
│   ├───obj
│   │   │   CapstoneAPI.Application.csproj.nuget.dgspec.json
│   │   │   CapstoneAPI.Application.csproj.nuget.g.props
│   │   │   CapstoneAPI.Application.csproj.nuget.g.targets
│   │   │   project.assets.json
│   │   │   project.nuget.cache
│   │   │
│   │   └───Debug
│   │       └───net8.0
│   │           │   .NETCoreApp,Version=v8.0.AssemblyAttributes.cs
│   │           │   Capstone.C478532C.Up2Date
│   │           │   CapstoneAPI.Application.AssemblyInfo.cs
│   │           │   CapstoneAPI.Application.AssemblyInfoInputs.cache
│   │           │   CapstoneAPI.Application.assets.cache
│   │           │   CapstoneAPI.Application.csproj.AssemblyReference.cache
│   │           │   CapstoneAPI.Application.csproj.BuildWithSkipAnalyzers
│   │           │   CapstoneAPI.Application.csproj.CoreCompileInputs.cache
│   │           │   CapstoneAPI.Application.csproj.FileListAbsolute.txt
│   │           │   CapstoneAPI.Application.dll
│   │           │   CapstoneAPI.Application.GeneratedMSBuildEditorConfig.editorconfig
│   │           │   CapstoneAPI.Application.GlobalUsings.g.cs
│   │           │   CapstoneAPI.Application.pdb
│   │           │   CapstoneAPI.Application.sourcelink.json
│   │           │
│   │           ├───ref
│   │           │       CapstoneAPI.Application.dll
│   │           │
│   │           └───refint
│   │                   CapstoneAPI.Application.dll
│   │
│   └───Services
│           CodeExecutionService.cs
│           LinterService.cs
│
├───CapstoneAPI.Core
│   │   CapstoneAPI.Core.csproj
│   │
│   ├───bin
│   │   └───Debug
│   │       └───net8.0
│   │               CapstoneAPI.Core.deps.json
│   │               CapstoneAPI.Core.dll
│   │               CapstoneAPI.Core.pdb
│   │
│   ├───Interfaces
│   │       ICodeExecutionService.cs
│   │       ILinterService.cs
│   │       IPythonProcessManager.cs
│   │
│   ├───Models
│   │       CodeExecutionRequest.cs
│   │       CodeExecutionResult.cs
│   │       LintIssue.cs
│   │       LintRequest.cs
│   │       LintResult.cs
│   │
│   └───obj
│       │   CapstoneAPI.Core.csproj.nuget.dgspec.json
│       │   CapstoneAPI.Core.csproj.nuget.g.props
│       │   CapstoneAPI.Core.csproj.nuget.g.targets
│       │   project.assets.json
│       │   project.nuget.cache
│       │
│       └───Debug
│           └───net8.0
│               │   .NETCoreApp,Version=v8.0.AssemblyAttributes.cs
│               │   CapstoneAPI.Core.AssemblyInfo.cs
│               │   CapstoneAPI.Core.AssemblyInfoInputs.cache
│               │   CapstoneAPI.Core.assets.cache
│               │   CapstoneAPI.Core.csproj.BuildWithSkipAnalyzers
│               │   CapstoneAPI.Core.csproj.CoreCompileInputs.cache
│               │   CapstoneAPI.Core.csproj.FileListAbsolute.txt
│               │   CapstoneAPI.Core.dll
│               │   CapstoneAPI.Core.GeneratedMSBuildEditorConfig.editorconfig
│               │   CapstoneAPI.Core.GlobalUsings.g.cs
│               │   CapstoneAPI.Core.pdb
│               │   CapstoneAPI.Core.sourcelink.json
│               │
│               ├───ref
│               │       CapstoneAPI.Core.dll
│               │
│               └───refint
│                       CapstoneAPI.Core.dll
│
└───CapstoneAPI.Infrastructure
    │   CapstoneAPI.Infrastructure.csproj
    │   PythonProcessManager.cs
    │
    ├───bin
    │   └───Debug
    │       └───net8.0
    │               CapstoneAPI.Core.dll
    │               CapstoneAPI.Core.pdb
    │               CapstoneAPI.Infrastructure.deps.json
    │               CapstoneAPI.Infrastructure.dll
    │               CapstoneAPI.Infrastructure.pdb
    │
    ├───obj
    │   │   CapstoneAPI.Infrastructure.csproj.nuget.dgspec.json
    │   │   CapstoneAPI.Infrastructure.csproj.nuget.g.props
    │   │   CapstoneAPI.Infrastructure.csproj.nuget.g.targets
    │   │   project.assets.json
    │   │   project.nuget.cache
    │   │
    │   └───Debug
    │       └───net8.0
    │           │   .NETCoreApp,Version=v8.0.AssemblyAttributes.cs
    │           │   Capstone.AD785D96.Up2Date
    │           │   CapstoneAPI.Infrastructure.AssemblyInfo.cs
    │           │   CapstoneAPI.Infrastructure.AssemblyInfoInputs.cache
    │           │   CapstoneAPI.Infrastructure.assets.cache
    │           │   CapstoneAPI.Infrastructure.csproj.AssemblyReference.cache
    │           │   CapstoneAPI.Infrastructure.csproj.BuildWithSkipAnalyzers
    │           │   CapstoneAPI.Infrastructure.csproj.CoreCompileInputs.cache
    │           │   CapstoneAPI.Infrastructure.csproj.FileListAbsolute.txt
    │           │   CapstoneAPI.Infrastructure.dll
    │           │   CapstoneAPI.Infrastructure.GeneratedMSBuildEditorConfig.editorconfig
    │           │   CapstoneAPI.Infrastructure.GlobalUsings.g.cs
    │           │   CapstoneAPI.Infrastructure.pdb
    │           │   CapstoneAPI.Infrastructure.sourcelink.json
    │           │
    │           ├───ref
    │           │       CapstoneAPI.Infrastructure.dll
    │           │
    │           └───refint
    │                   CapstoneAPI.Infrastructure.dll
    │
    └───Python
        │   .gitignore
        │   linter.py
        │   python_worker.py
        │   README.md
        │
        ├───rules
        │   │   base_rule.py
        │   │   discouraged_import_rule.py
        │   │   missing_docstring_rule.py
        │   │   naming_convention_rule.py
        │   │   none_comparison_rule.py
        │   │   too_many_args_rule.py
        │   │   unused_function_rule.py
        │   │   unused_variable_rule.py
        │   │   use_logging_rule.py
        │   │   __init__.py

```

The project is generally split up into 3 chunks. Application, Core and Infrastructure.

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
### Structure
- https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
  - I didn't like how the project was structured, found this and decided to just make the swap
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

## ORM stuff to show the prof
- https://github.com/DapperLib/Dapper
- https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/retrieving-data-using-a-datareader
- https://learn.microsoft.com/en-us/ef/core/querying/
