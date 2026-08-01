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
            else
            {
                return StatusCode((int)response.StatusCode, new { message = "ML Service returned an error." });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to communicate with ML Service.", error = ex.Message });
        }
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
            else
            {
                return StatusCode((int)response.StatusCode, new { message = "ML Service returned an error." });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to communicate with ML Service.", error = ex.Message });
        }
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
