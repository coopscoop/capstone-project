# # Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Cloud Run requires listening on the PORT env var (usually 8080)
# This is the correct way to set it for ASP.NET Core:
ENV ASPNETCORE_URLS=http://+:$PORT

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Capstone.API/Capstone.API.csproj", "Capstone.API/"]
COPY ["Capstone.Infrastructure/Capstone.Infrastructure.csproj", "Capstone.Infrastructure/"]
RUN dotnet restore "Capstone.API/Capstone.API.csproj"
COPY .
# .
WORKDIR "/src/Capstone.API"
RUN dotnet build "Capstone.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Capstone.API.csproj" -c Release -o /app/publish

# --- FINAL STAGE: Include Python if necessary for runtime ---
FROM base AS final
WORKDIR /app

# **CRITICAL CHANGE (If Python is a hard requirement for the app to run):**
# Use a custom base image that already has .NET and Python, or accept the size increase.
# The current multi-line installation is correct for an 'apt' based image.
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=publish /app/publish .
# # Copy Python scripts explicitly
COPY Capstone.Infrastructure/Python /app/Python

# Your entry point remains correct.
ENTRYPOINT ["dotnet", "Capstone.API.dll"]