using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.DTOs;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResourcesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ResourcesController(AppDbContext db) => _db = db;

    /// <summary>GET /api/resources — list all learning resources, optionally filtered by skill name and user completion status</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? skill = null, [FromQuery] Guid? userId = null)
    {
        var query = _db.LearningResources
            .Include(lr => lr.Skill)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(skill))
        {
            query = query.Where(lr => lr.Skill.Name.ToLower().Contains(skill.ToLower()));
        }

        var resources = await query.OrderBy(lr => lr.Skill.Name).ThenBy(lr => lr.Title).ToListAsync();

        var completedResourceIds = new HashSet<Guid>();
        if (userId.HasValue)
        {
            completedResourceIds = new HashSet<Guid>(
                await _db.UserResources
                    .Where(ur => ur.UserId == userId.Value && ur.IsCompleted)
                    .Select(ur => ur.ResourceId)
                    .ToListAsync()
            );
        }

        // Group by skill name (matching frontend's resourcesCatalog shape)
        var grouped = resources
            .GroupBy(r => r.Skill.Name)
            .ToDictionary(
                g => g.Key,
                g => g.Select(r => new ResourceDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Platform = r.Platform,
                    Url = r.Url,
                    Duration = r.Duration,
                    Cost = r.Cost,
                    SkillName = r.Skill.Name,
                    IsCompleted = completedResourceIds.Contains(r.Id)
                }).ToList()
            );

        return Ok(grouped);
    }

    /// <summary>POST /api/resources/{resourceId}/progress — update completion progress of a learning resource</summary>
    [HttpPost("{resourceId:guid}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid resourceId, [FromQuery] Guid userId, [FromBody] ResourceProgressRequest req)
    {
        var resource = await _db.LearningResources.FindAsync(resourceId);
        if (resource == null)
            return NotFound(new { message = "Resource not found." });

        var userResource = await _db.UserResources
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.ResourceId == resourceId);

        if (userResource == null)
        {
            userResource = new Models.UserResource
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ResourceId = resourceId,
                IsCompleted = req.IsCompleted,
                CompletedAt = DateTime.UtcNow
            };
            _db.UserResources.Add(userResource);
        }
        else
        {
            userResource.IsCompleted = req.IsCompleted;
            userResource.CompletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Progress updated successfully.", isCompleted = userResource.IsCompleted });
    }

    /// <summary>POST /api/resources — [Admin] Create a new resource</summary>
    [HttpPost]
    public async Task<IActionResult> CreateResource([FromBody] ResourceCreateRequest req)
    {
        var skill = await _db.Skills.FirstOrDefaultAsync(s => s.Name == req.SkillName);
        if (skill == null)
            return BadRequest(new { message = "Skill not found." });

        var resource = new Models.LearningResource
        {
            Id = Guid.NewGuid(),
            SkillId = skill.Id,
            Title = req.Title,
            Platform = req.Platform,
            Url = req.Url,
            Duration = req.Duration,
            Cost = req.Cost
        };

        _db.LearningResources.Add(resource);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = resource.Id }, resource);
    }

    /// <summary>DELETE /api/resources/{id} — [Admin] Delete a resource</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteResource(Guid id)
    {
        var resource = await _db.LearningResources.FindAsync(id);
        if (resource == null)
            return NotFound(new { message = "Resource not found." });

        _db.LearningResources.Remove(resource);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Resource deleted successfully." });
    }
}
