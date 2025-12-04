> [!NOTE]
> Massive first commits were because I was working in another repo unintentionally, moved things over so it's massive chunks at once.
> The majority of the templating for the project was also auto generated so it's very large

> [!WARNING]
> The cloud run deployment as a generous free tier so it shouldn't ever exceed the free tier limits.
> The database however will only be up for ~3 months as of 2025/11/26, it will stop working on 2026/02/16ish
>
> Past this date hosting locally would be the easiest solution to run the project.

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

> [!NOTE]
> Anything using docker requires the Docker Engine to be running. Make sure it's on or it'll just error out.

This section is mostly for me and is just some quick notes on how I deployed this. Deploying locally, both the front, back and database are all in containers and can be run with docker-compose.

To deploy the project you'll need to have docker and docker-compose installed, and there's 3 basic commands to know:
- `docker-compose build --no-cache` to build the containers if you've made changes, the --no-cache flag is optional but it'll make sure that there's no cache vs what you have parity problems.
- `docker-compose up` to start the containers

If the containers are running you can use:
- `docker-compose down -v` to stop the containers, -v is optional but it'll remove the volumes as well.

Simply run those in the root of the project to start the containers.

> [!NOTE]
> Note: you can also add a `--build` flag to the `docker-compose up` command to build the containers if you've made changes.

### Building the containers

Initially docker needs to be enabled using `gcloud auth configure-docker`

The the containers are built using docker, then pushed to googles container registry.

To build the containers use the `docker build` command, to push then use `docker push`.

General commands look like:

`docker build -t gcr.io/[PROJECT-ID]/[IMAGE-NAME] .`
`docker push gcr.io/[PROJECT-ID]/[IMAGE-NAME]`

### What I used

Following the above examples, I used the following:

For the backend:
`docker build -t gcr.io/capstone-479500/capstone-backend .`
`docker push gcr.io/capstone-479500/capstone-backend`

For the frontend:
`docker build -t gcr.io/capstone-479500/capstone-frontend .`
`docker push gcr.io/capstone-479500/capstone-frontend`

### Set the VPC connector

Inside google's systems they've got a private VPC network that we're allowed to use for routing. For the sake of secutiry and air gapping as much as possible I'm using the VPC for the backend and the database.

The general idea is that the backend/database are hidden from the wider internet, but the frontend is exposed and as such the inputs to the system can be controlled.

To set one up use the command:

```bash
gcloud compute networks vpc-access connectors create [NAME] \
    --region=[YOUR_REGION] \
    --network=default \
    --range=[NETWORK_RANGE]
```

I used the following:

```bash
gcloud compute networks vpc-access connectors create capstone-connector --region=northamerica-northeast1 --network=default --range=172.16.2.0/28
```
Worst case it fails delete it:
```bash
gcloud compute networks vpc-access connectors delete capstone-connector --region=us-northamerica-northeast1 --async
```

- `us-central1` is a Toronto server
- `default` is the default VPC network
- `10.128.0.0/28` is the network range I'm using, it's an open ip that I've been given, you can check what open ones are available by running `gcloud compute networks subnets list --network=default --format="table(NAME,REGION,RANGE)"`