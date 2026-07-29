using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.DTOs;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/users/{userId:guid}/skills")]
public class SkillsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SkillsController(AppDbContext db) => _db = db;

    /// <summary>GET /api/users/{userId}/skills — list all skills with user's levels</summary>
    [HttpGet]
    public async Task<IActionResult> GetUserSkills(Guid userId)
    {
        var userExists = await _db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return NotFound(new { message = "User not found." });

        // Get all skills, left-joined with user levels
        var allSkills = await _db.Skills.OrderBy(s => s.Category).ThenBy(s => s.Name).ToListAsync();
        var userSkills = await _db.UserSkills
            .Where(us => us.UserId == userId)
            .ToDictionaryAsync(us => us.SkillId, us => us.Level);

        var result = allSkills.Select(s => new SkillDto
        {
            Id = s.Id,
            Name = s.Name,
            Category = s.Category,
            Level = userSkills.GetValueOrDefault(s.Id, 0)
        }).ToList();

        return Ok(result);
    }

    /// <summary>PUT /api/users/{userId}/skills/{skillId} — update a single skill level</summary>
    [HttpPut("{skillId:guid}")]
    public async Task<IActionResult> UpdateSkillLevel(Guid userId, Guid skillId, [FromBody] SkillUpdateRequest req)
    {
        if (req.Level < 0 || req.Level > 5)
            return BadRequest(new { message = "Level must be between 0 and 5." });

        var userSkill = await _db.UserSkills
            .FirstOrDefaultAsync(us => us.UserId == userId && us.SkillId == skillId);

        if (userSkill == null)
        {
            // Auto-create entry if missing
            userSkill = new Models.UserSkill
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                SkillId = skillId,
                Level = req.Level
            };
            _db.UserSkills.Add(userSkill);
        }
        else
        {
            // Calculate XP reward (server-side authoritative)
            int diff = req.Level - userSkill.Level;
            if (diff > 0)
            {
                var user = await _db.Users.FindAsync(userId);
                if (user != null)
                {
                    int xpGain = diff * 250;
                    user.Xp += xpGain;

                    // Auto-level up
                    int maxXp = CalculateMaxXp(user.Level);
                    while (user.Xp >= maxXp)
                    {
                        user.Xp -= maxXp;
                        user.Level += 1;
                        maxXp = CalculateMaxXp(user.Level);
                    }

                    user.LastActive = DateTime.UtcNow;
                }
            }

            userSkill.Level = req.Level;
        }

        await _db.SaveChangesAsync();

        // Return updated user profile after XP changes
        var updatedUser = await _db.Users
            .Include(u => u.UserAchievements)
            .FirstOrDefaultAsync(u => u.Id == userId);

        return Ok(new
        {
            skill = new SkillDto
            {
                Id = skillId,
                Name = (await _db.Skills.FindAsync(skillId))?.Name ?? "",
                Category = (await _db.Skills.FindAsync(skillId))?.Category ?? "",
                Level = req.Level
            },
            user = updatedUser == null ? null : new UserDto
            {
                Id = updatedUser.Id,
                Name = updatedUser.Name,
                Email = updatedUser.Email,
                Level = updatedUser.Level,
                Xp = updatedUser.Xp,
                MaxXp = CalculateMaxXp(updatedUser.Level),
                Streak = updatedUser.Streak,
                BadgesEarned = updatedUser.UserAchievements.Count,
                Bio = updatedUser.Bio,
                GithubUrl = updatedUser.GithubUrl,
                LinkedinUrl = updatedUser.LinkedinUrl,
                IsAdmin = updatedUser.IsAdmin
            }
        });
    }

    private static int CalculateMaxXp(int level)
    {
        int maxXp = 3000;
        for (int i = 1; i < level; i++)
            maxXp = (int)Math.Round(maxXp * 1.25);
        return maxXp;
    }

    /// <summary>GET /api/skills — list all skills globally</summary>
    [HttpGet("/api/skills")]
    public async Task<IActionResult> GetAllSkills()
    {
        var skills = await _db.Skills.OrderBy(s => s.Category).ThenBy(s => s.Name).ToListAsync();
        return Ok(skills);
    }

    /// <summary>POST /api/skills — [Admin] Create a new skill</summary>
    [HttpPost("/api/skills")]
    public async Task<IActionResult> CreateSkill([FromBody] SkillCreateRequest req)
    {
        var existingSkill = await _db.Skills.FirstOrDefaultAsync(s => s.Name.ToLower() == req.Name.ToLower());
        if (existingSkill != null)
            return BadRequest(new { message = "Skill already exists." });

        var skill = new Models.Skill
        {
            Id = Guid.NewGuid(),
            Name = req.Name,
            Category = req.Category
        };

        _db.Skills.Add(skill);
        await _db.SaveChangesAsync();

        return Ok(new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Category = skill.Category,
            Level = 0
        });
    }

    /// <summary>DELETE /api/skills/{id} — [Admin] Delete a skill</summary>
    [HttpDelete("/api/skills/{id:guid}")]
    public async Task<IActionResult> DeleteSkill(Guid id)
    {
        var skill = await _db.Skills.FindAsync(id);
        if (skill == null)
            return NotFound(new { message = "Skill not found." });

        _db.Skills.Remove(skill);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Skill deleted successfully." });
    }
}
