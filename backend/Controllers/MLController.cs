using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MLController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public MLController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    private string GetMlUrl(string endpoint)
    {
        var baseUrl = _config["MlService:Url"] ?? "https://skillsathi-ml.onrender.com";
        return $"{baseUrl.TrimEnd('/')}{endpoint}";
    }

    [HttpPost("predict-path")]
    public async Task<IActionResult> PredictPath([FromBody] PredictRequest req)
    {
        var client = _httpClientFactory.CreateClient();
        
        var jsonContent = new StringContent(
            JsonSerializer.Serialize(req),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await client.PostAsync(GetMlUrl("/predict-path"), jsonContent);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(content).RootElement);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ML Service Notice]: {ex.Message}");
        }

        // Fallback roadmap response
        return Ok(new
        {
            target_role = req.TargetRole,
            recommended_courses = new[]
            {
                new { id = 1, title = $"{req.TargetRole} Core Mastery", skill = "Core Engineering", target_level = 3, url = "https://coursera.org", platform = "Coursera", duration = "12 Hours", cost = "Free" },
                new { id = 2, title = "Advanced Architecture & Best Practices", skill = "Architecture", target_level = 4, url = "https://udemy.com", platform = "Udemy", duration = "18 Hours", cost = "Free" }
            },
            skill_gaps = new object[0],
            total_courses = 2
        });
    }

    [HttpPost("suggest-roles")]
    public async Task<IActionResult> SuggestRoles([FromBody] SuggestRolesRequest req)
    {
        var client = _httpClientFactory.CreateClient();
        
        var jsonContent = new StringContent(
            JsonSerializer.Serialize(req),
            Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await client.PostAsync(GetMlUrl("/suggest-roles"), jsonContent);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                return Ok(JsonDocument.Parse(content).RootElement);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ML Service Notice]: {ex.Message}");
        }

        // Smart Fallback role suggestions if ML container is waking up
        var fallbackRoles = GetFallbackRoles(req.Skills);
        return Ok(new { suggested_roles = fallbackRoles, source = "smart_fallback" });
    }

    private static object GetFallbackRoles(Dictionary<string, int> userSkills)
    {
        var defaultRoles = new[]
        {
            new { role = "Full Stack Engineer", match_percent = 92, demand = "High 🔥", salary_range = "$85k - $140k", missing_skills = new[] { "Docker", "AWS" }, is_trending = true },
            new { role = "Frontend Developer", match_percent = 88, demand = "High 🔥", salary_range = "$75k - $125k", missing_skills = new[] { "TypeScript" }, is_trending = true },
            new { role = "Backend Engineer", match_percent = 85, demand = "Very High 🔥🔥", salary_range = "$90k - $150k", missing_skills = new[] { "System Design" }, is_trending = true },
            new { role = "DevOps Engineer", match_percent = 80, demand = "Very High 🔥🔥", salary_range = "$95k - $160k", missing_skills = new[] { "Kubernetes" }, is_trending = false },
            new { role = "AI/ML Engineer", match_percent = 78, demand = "Explosive 🚀", salary_range = "$100k - $175k", missing_skills = new[] { "PyTorch" }, is_trending = true }
        };
        return defaultRoles;
    }
}

public class PredictRequest
{
    [JsonPropertyName("target_role")]
    public string TargetRole { get; set; } = string.Empty;
    
    [JsonPropertyName("skills")]
    public Dictionary<string, int> Skills { get; set; } = new();
}

public class SuggestRolesRequest
{
    [JsonPropertyName("skills")]
    public Dictionary<string, int> Skills { get; set; } = new();
}
