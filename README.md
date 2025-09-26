> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python.

## Setup

-   Build IronPython3: See Step 2.
-   Backend: cd backend && dotnet run (http://localhost:5000)
-   Frontend: cd frontend && npm start (http://localhost:3000)
-   Tests: cd tests && dotnet test

## IronPython3

-   Native .NET implementation of python
-   Used for creating the AST, then analyzed for linting and static analysis

## The general structure goes as follows (subject to change):

A monorepo with a react frontend and ASP.NET backend

```
TODO
```

## Frontend

The frontend of the app, I plan on using React with typescript to develop this. Styling wise I'll be learning Tailwind and doing most of it from scratch, probably some stuff from [mui](https://mui.com/)

## CapstoneLinter

Generally phase one of the project. I plan on using IronPython (still need to migrate over) for generating the AST from the python code as it's fully native to .NET/C#, then writing my own rules for basic Linting/Static analysis on the code

## CapstoneBackend

the .NET backend for the website frontend, also interfaces with the Frontend and Linter

# CapstoneTests

xUnit Tests for creating automated tests on both my linter and backend
