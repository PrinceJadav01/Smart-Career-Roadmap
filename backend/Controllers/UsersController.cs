using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.DTOs;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    /// <summary>GET /api/users/{id}</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.UserAchievements)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        int maxXp = CalculateMaxXp(user.Level);

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Level = user.Level,
            Xp = user.Xp,
            MaxXp = maxXp,
            Streak = user.Streak,
            BadgesEarned = user.UserAchievements.Count,
            Bio = user.Bio,
            GithubUrl = user.GithubUrl,
            LinkedinUrl = user.LinkedinUrl,
            IsAdmin = user.IsAdmin,
            Tokens = user.Tokens
        });
    }

    /// <summary>PUT /api/users/{id} — update profile fields like xp, level, streak</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        user.Name = dto.Name;
        user.Xp = dto.Xp;
        user.Level = dto.Level;
        user.Streak = dto.Streak;
        user.Bio = dto.Bio;
        user.GithubUrl = dto.GithubUrl;
        user.LinkedinUrl = dto.LinkedinUrl;
        user.LastActive = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Level = user.Level,
            Xp = user.Xp,
            MaxXp = CalculateMaxXp(user.Level),
            Streak = user.Streak,
            BadgesEarned = dto.BadgesEarned,
            Bio = user.Bio,
            GithubUrl = user.GithubUrl,
            LinkedinUrl = user.LinkedinUrl,
            IsAdmin = user.IsAdmin,
            Tokens = user.Tokens
        });
    }

    private static int CalculateMaxXp(int level)
    {
        int maxXp = 3000;
        for (int i = 1; i < level; i++)
            maxXp = (int)Math.Round(maxXp * 1.25);
        return maxXp;
    }
}
