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
        var roleSpecs = new[]
        {
            new { Role = "Frontend Developer", Demand = "High 🔥", Salary = "₹6-18 LPA", Trending = true, Reqs = new[] { ("HTML & CSS", 5), ("JavaScript", 5), ("React JS", 5), ("Tailwind CSS", 4), ("TypeScript", 4) } },
            new { Role = "Backend Engineer", Demand = "Critical 🔥🔥", Salary = "₹8-22 LPA", Trending = true, Reqs = new[] { ("C# Programming", 5), ("ASP.NET Core", 5), ("REST APIs", 5), ("PostgreSQL", 4), ("Node.js", 3) } },
            new { Role = "Full Stack Engineer", Demand = "Critical 🔥🔥", Salary = "₹10-25 LPA", Trending = true, Reqs = new[] { ("HTML & CSS", 4), ("JavaScript", 5), ("React JS", 5), ("C# Programming", 4), ("ASP.NET Core", 4), ("REST APIs", 5), ("PostgreSQL", 4) } },
            new { Role = "AI/ML Engineer", Demand = "Explosive 🚀", Salary = "₹12-28 LPA", Trending = true, Reqs = new[] { ("Python Core", 5), ("FastAPI", 4), ("scikit-learn", 5), ("Pandas & NumPy", 5), ("REST APIs", 3) } },
            new { Role = "DevOps Engineer", Demand = "Very High 🔥🔥", Salary = "₹15-28 LPA", Trending = false, Reqs = new[] { ("Docker", 5), ("AWS", 4), ("Git", 4), ("Python Core", 3), ("Kubernetes", 4) } }
        };

        bool hasAnySkills = userSkills != null && userSkills.Values.Any(v => v > 0);

        var scored = roleSpecs.Select(spec =>
        {
            int totalWeight = spec.Reqs.Sum(r => r.Item2);
            int userScore = 0;
            var missing = new List<string>();

            foreach (var req in spec.Reqs)
            {
                int userLvl = 0;
                if (userSkills != null)
                {
                    // Case-insensitive lookup
                    var key = userSkills.Keys.FirstOrDefault(k => k.Equals(req.Item1, StringComparison.OrdinalIgnoreCase));
                    if (key != null) userLvl = userSkills[key];
                }

                if (userLvl >= req.Item2)
                {
                    userScore += req.Item2;
                }
                else if (userLvl > 0)
                {
                    userScore += userLvl;
                    missing.Add(req.Item1);
                }
                else
                {
                    missing.Add(req.Item1);
                }
            }

            int matchPct = (hasAnySkills && totalWeight > 0)
                ? (int)Math.Round((double)userScore / totalWeight * 100)
                : 0;

            return new
            {
                role = spec.Role,
                match_percent = matchPct,
                demand = spec.Demand,
                salary_range = spec.Salary,
                missing_skills = missing,
                is_trending = spec.Trending
            };
        })
        .OrderByDescending(r => r.match_percent)
        .ToList();

        return scored;
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
