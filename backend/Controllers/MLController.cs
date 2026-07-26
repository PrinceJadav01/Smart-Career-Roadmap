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

    public MLController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
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
            var response = await client.PostAsync("http://localhost:8000/predict-path", jsonContent);
            
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
            var response = await client.PostAsync("http://localhost:8000/suggest-roles", jsonContent);
            
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
