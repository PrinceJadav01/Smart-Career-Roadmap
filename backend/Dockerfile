FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV PORT=10000
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
EXPOSE 10000
ENTRYPOINT ["dotnet", "SmartCareerRoadmap.API.dll"]
