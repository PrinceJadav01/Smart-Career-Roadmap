FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["SmartCareerRoadmap.API.csproj", "./"]
RUN dotnet restore "SmartCareerRoadmap.API.csproj"
COPY . .
RUN dotnet publish "SmartCareerRoadmap.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "SmartCareerRoadmap.API.dll"]
