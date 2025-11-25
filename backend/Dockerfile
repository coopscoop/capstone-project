# Dockerfile (in backend/)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Capstone.sln", "./"]
COPY ["Capstone.API/", "Capstone.API/"]
COPY ["Capstone.Application/", "Capstone.Application/"]
COPY ["Capstone.Core/", "Capstone.Core/"]
COPY ["Capstone.Infrastructure/", "Capstone.Infrastructure/"]
COPY ["Capstone.Tests/", "Capstone.Tests/"]

RUN dotnet restore "Capstone.sln"
RUN dotnet build "Capstone.sln" -c Release -o /app/build --no-restore
RUN dotnet publish "Capstone.API/Capstone.API.csproj" -c Release -o /app/publish --no-build

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5225
ENV ASPNETCORE_URLS=http://+:5225

ENTRYPOINT ["dotnet", "Capstone.API.dll"]