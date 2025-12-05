FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Capstone.API/Capstone.API.csproj", "Capstone.API/"]
COPY ["Capstone.Infrastructure/Capstone.Infrastructure.csproj", "Capstone.Infrastructure/"]
RUN dotnet restore "Capstone.API/Capstone.API.csproj"
COPY . .

WORKDIR "/src/Capstone.API"
RUN dotnet build "Capstone.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Capstone.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app

RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
COPY Capstone.Infrastructure/Python /app/Python

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Capstone.API.dll"]