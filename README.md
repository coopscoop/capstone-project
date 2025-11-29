> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large

> [!WARNING]
> The cloud run deployment as a generous free tier so it shouldn't ever exceed the free tier limits.
> The database however will only be up for ~3 months as of 2025/11/26, it will stop working on 2026/02/16ish
>
> Past this date hosting locally would be the easiest solution to run the project.

# TODO
- backend
  - move jwt/email env variables to secrets on remote
  - fix linter api - some isValid checks are failing
  - logging
- frontend
  - fix logout
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

If you'd like to use containerized deployment, check out the [Development](#development) section below.

### Backend

> [!NOTE]
> The tests are currently only for the linter/execution services, the rest of the API is not set up yet

- `cd backend/Capstone.API` to go to the backend
- `dotnet run`, or open the `.sln` file in `/backend` and run `Capstone.API` using `http`.

Both create a `/swagger page` to test the API

Like the frontend, you can also run the backend with containerized deployment, check out the [Development](#development) section below.

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

## Deployment itself

This section is mostly for me and is just some quick notes on how I deployed this. Deploying locally, both the front, back and database are all in containers and can be run with docker-compose.

To deploy the project you'll need to have docker and docker-compose installed, and there's 3 commands to know:
- `docker-compose up` to start the containers
- `docker-compose down` to stop the containers
- `docker-compose build` to build the containers if you've made changes.

Simply run those in the root of the project to start the containers.

> [!NOTE]
> Note: you can also add a `--build` flag to the `docker-compose up` command to build the containers if you've made changes.

### Frontend

To publish/update the frontend, we push from local (current working directory) to the remote google cloud run service. This is done with the following command:

`cd frontend`

`gcloud run deploy capstone-frontend --source . --platform managed --region northamerica-northeast2 --allow-unauthenticated --memory 512Mi --cpu 1 --min-instances 0 --max-instances 1 --port 8080 --build-env VITE_API_URL=https://capstone-backend-657482441130.northamerica-northeast2.run.app`

Most the flags are self explainatory, but the `--allow-unauthenticated` flag is required to allow the frontend to be accessed without a login.
Because this is on cloud run it scales to useage automatically. 0 minimum allows it to scale to 0, and 2 caps it so worst case I don't have a big bill to pay.

### Backend

The backend is deployed to google cloud run as well, updated/pushed to the remote service (same as the frontend, it pushes the current working directory) with the following command:

`cd backend`

`gcloud run deploy capstone-backend --source . --region northamerica-northeast2 --env-vars-file env.yaml`

The env.yaml file is a simple file that contains the environment variables for the backend instead of manually setting them in the command line.

This file simply looks like a regular .env file but isn't committed to the repo. Look at the env.yaml.example file for an example of what it should look like.
