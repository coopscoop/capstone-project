# TODO
- [ ] add front end (typescript?)
- [ ] refactor rules impementation to properly pull from the `/Rules` directory without requiring change elsewhere
- [ ] refactor `/CapstoneLinter` to follow better file organization? unsure if I like how it is now

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python.

## Setup (subject to change)

-   Backend: cd backend && dotnet run (http://localhost:5041/swagger for testing the API)
-   Frontend: cd frontend && npm start (http://localhost:3000)
-   Tests: cd tests && dotnet test
> ![NOTE]
> both the `Frontend` and `Tests` are currently not implemented

## AST

The idea going into this project was to make my own simple python parser, although upon attempting it I realized I was in way over my head for the scope of this project, and so I decided to find a parser and write the linter rules instead. Went through many, many, *many* iterations as to how I was going to do this. Initially I wanted just keep everything in the .NET/C# ecosystem and as such I turned to libraries. There were a few standouts:
-   [ANTLR](https://github.com/antlr/antlr4) which is a powerful parser that can do many languages, python being one. I tried for a while but in the end couldn't get it to work, although I'm sure it'd be one of the, if not, the fastest implementation of what I want to do. (Might look at this again over break week)
-   [IronPython](https://github.com/IronLanguages/ironpython3) - officially only supports up to python 2.7 with a community version that's up to python 3.4, generally older and in practice didn't have the documentation I needed to get it to compile.
-   [PythonNet](https://github.com/pythonnet/pythonnet) - allows python to be run as part of the .NET CLR. I could get it to compile although part way through implementing this I realized I could just use json as a communication layer and just use python's built in AST.
-   Where I ended up in the end - I've got my api send the code to a .py file that uses Python's built in AST generator, that then gets passed out as .json to my Linter. The linter then runs the rules and returns the responses to the user.

## The general structure goes as follows (subject to change)

A monorepo with a react frontend and ASP.NET backend.

```
├───CapstoneBackend
│   │   appsettings.Development.json
│   │   appsettings.json
│   │   CapstoneBackend.csproj
│   │   CapstoneBackend.http
│   │   Program.cs
│   ├───bin
│   │   └───...
│   ├───Models
│   │   └───...
│   ├───Services
│   │   └───LinterService.cs
│   └───Tools
│       └───ast_extractor.py
└───CapstoneLinter
    │   AstInfo.cs
    │   CapstoneLinter.csproj
    │   FunctionInfo.cs
    │   ILintRule.cs
    │   LinterEngine.cs
    │   LinterResult.cs
    │   WildcardImportInfo.cs
    └───Rules
        └───...
```

## Frontend

The frontend of the app, I plan on using React with typescript to develop this. Styling wise I'll be learning Tailwind and doing most of it from scratch, probably some stuff from [mui](https://mui.com/).

## CapstoneLinter

Generally phase one of the project. Using python's built in AST generator for the AST from the user written python code, then wrote my own rules for basic Linting/Static analysis on the code.

## CapstoneBackend

The .NET backend for the site, interfaces with the Frontend and Linter.

# CapstoneTests

> [!IMPORTANT]
> xUnit Tests are not implemented yet, these will be implemented once I add more rules and can begin testing.

xUnit Tests for creating automated tests on both my linter and backend.
