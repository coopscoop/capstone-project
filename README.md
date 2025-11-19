> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large
>
> As of October 14th I've decided to just start over on the backend with better practice. It's simply not scalable and or set up properly.

# TODO
- backend
  - fix logout
  - add endpoint to properpy get a post + tags
  - push to remote
  - extend jwt token expiry/add extender token
  - push to remote
  - move jwt/email env variables to secrets on remote
  - fix linter api - some isValid checks are failing
  - logging
- frontend
  - add backend objects to frontend
  - add util classes for all api calls
  - finish user flow/menus
  - logging

# Capstone - Online Python IDE

Welcome! This is my capstone project, it's effectively a simplified [replit](https://replit.com/) clone, but just for python with a custom made linter.

## Setup (subject to change)

### Frontend
- `cd frontend` to go to the frontend
- `npm start` to run the frontend
  -   `npm install` is required for a first time run
### Backend

> [!NOTE]
> The tests are currently only for the linter/execution services, the rest of the API is not set up yet

- `cd backend` to go to the backend
- `dotnet run`, or open the `.sln` file in `/backend` and run using `http`. (both create a /swagger page to test the API)
  -   `dotnet build` is required for a first time run
### Tests
- `cd backend` to go to the backend
- `dotnet test --filter Category!=Integration` to run the tests. This uses a mock system seperate from the real API, doesn't require the API to be running

> [!WARNING]
> The integration tests will fail if the backend isn't running. Follow the isntructions above to run the backend

- `dotnet test --filter Category=Integration` to run the integration tests.
- Optionally you can run all the tests by simply running `dotnet test`

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

## Deployment Strategy

This app will be deployed to a google cloud run environment. Both google cloud run and CloudSQL have free tiers that can be worked within for a no cost deployment/testing cycle.

General structure is made up of 3 services:
1. Frontend - Where the front end gets served from
2. Backend - All API calls/services
3. Database - CloudSQL as a remote postgres database
