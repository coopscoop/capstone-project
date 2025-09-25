> [!note] Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once

# Capstone - Online Python IDE
Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python.

## The general structure goes as follows (subject to change):
```
├─ Frontend/
│  ├── node_modules/
│  ├── public/
│  │   └── ...
│  ├── src/
│  │   └── ...
│  ├── package.json
│  └── package-lock.json
├─ CapstoneLinter/
│  ├─ CapstoneLinter.csproj
│  ├─ Linter.cs
│  ├─ Rules/
│  │  ├─ IRule.cs
│  │  ├─ IndentationRule.cs
│  │  └─ ...
├─ CapstoneBackend/
│  ├─ CapstoneBackend.csproj
│  ├─ ...
├─ CapstoneTests/
│  ├─ CapstoneTests.csproj
│  ├─ ...
├─ Capstone.sln
└─ README.md
```
## Frontend
The frontend of the app, I plan on using React with typescript to develop this. Styling wise I'll be learning Tailwind and doing most of it from scratch, probably some stuff from [mui](https://mui.com/)

## CapstoneLinter
Generally phase one of the project. I plan on using IronPython (still need to migrate over) for generating the AST from the python code as it's fully native to .NET/C#, then writing my own rules for basic Linting/Static analysis on the code

## CapstoneBackend
the .NET backend for the website frontend, also interfaces with the Frontend and Linter

# CapstoneTests
xUnit Tests for creating automated tests on both my linter and backend.
