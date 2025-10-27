> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large
>
> As of October 14th I've decided to just start over on the backend with better practice. It's simply not scalable and or set up properly.

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python with a custom made linter.

## Setup (subject to change)

### Backend
- `cd backend` then `dotnet run`, or open the `.sln` file in `/backend` and run using `http`. (both create a /swagger page to test the API)
  -   `dotnet build` is required for a first time run
### Frontend
- `cd frontend` then `npm start`
  -   `npm install` is required for a first time run
### Tests
- `cd backend` then for offline (API isn't running in the background) use `dotnet test --filter Category!=Integration` to run the tests. This uses a mock system seperate from the real API
-   Use `dotnet test --filter Category=Integration` to run the integration tests. These use the actual API so make sure to have it running locally before testing
-   Optionally you can run all the tests by simply opening VS2022 and running the test suite that way  

## Frontend

The frontend is a react app, it's a single page app for the sake of simplicity and performance.
There's two main sections:
- The social media esque project browsing/favouriting
- Code writing/execution

For more details check the README [here](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/blob/main/frontend/README.md)

## Backend

The backend is a .NET Core API, it's a REST API that uses the `ASP.NET Core` framework. It's written in C# and uses `Dapper` for the ORM.
My linter is written in python and uses the built in `AST` to parse the code and return a list of custom errors.

It's a simple REST API that uses the `ASP.NET Core` framework that uses [Dapper](https://github.com/DapperLib/Dapper) for the ORM.

For more details check README [here](https://github.com/Steve-at-Mohawk-College/capstone-project-coopscoop/blob/main/backend/README.md)


