FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Torq.Api/Torq.Api.csproj Torq.Api/
RUN dotnet restore Torq.Api/Torq.Api.csproj
COPY Torq.Api/ Torq.Api/
RUN dotnet publish Torq.Api/Torq.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000
CMD ASPNETCORE_URLS=http://0.0.0.0:${PORT:-10000} dotnet Torq.Api.dll
