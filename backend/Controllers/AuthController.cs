using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.DTOs;
using SmartCareerRoadmap.API.Models;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    /// <summary>POST /api/auth/login</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        // Server-side validation
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required." });

        if (string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Password is required." });

        if (!IsValidEmail(req.Email))
            return BadRequest(new { message = "Invalid email format." });

        var user = await _db.Users
            .Include(u => u.UserAchievements)
            .FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null)
            return Unauthorized(new { message = "No account found with this email address." });

        if (user.IsDeleted)
            return Unauthorized(new { message = "This account has been deactivated/archived. Please contact an administrator to restore access." });

        // Verify password hash
        bool valid = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!valid)
            return Unauthorized(new { message = "Incorrect password. Please try again." });

        // Generate JWT token
        var token = GenerateJwt(user);

        // Calculate MaxXP for the current level
        int maxXp = CalculateMaxXp(user.Level);

        return Ok(new AuthResponse
        {
            Token = token,
            User = MapUserToDto(user, maxXp)
        });
    }

    /// <summary>POST /api/auth/register</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        // ── Server-side validation ─────────────────────────────
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest(new { message = "Full name is required." });

        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { message = "Email is required." });

        if (!IsValidEmail(req.Email))
            return BadRequest(new { message = "Invalid email format." });

        if (string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Password is required." });

        if (req.Password.Length < 6)
            return BadRequest(new { message = "Password must be at least 6 characters." });

        if (req.Password != req.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match." });

        if (!string.IsNullOrWhiteSpace(req.PhoneNumber) && !Regex.IsMatch(req.PhoneNumber, @"^\d{10,15}$"))
            return BadRequest(new { message = "Phone number must be 10-15 digits." });

        // Check for existing user
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "An account with this email already exists." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Email = req.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Level = 1,
            Xp = 0,
            Streak = 0,
            PhoneNumber = req.PhoneNumber?.Trim(),
            EducationLevel = req.EducationLevel?.Trim(),
            FieldOfStudy = req.FieldOfStudy?.Trim()
        };

        _db.Users.Add(user);

        // Auto-create user_skills entries (level 0) for all skills
        var allSkills = await _db.Skills.ToListAsync();
        foreach (var skill in allSkills)
        {
            _db.UserSkills.Add(new UserSkill
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                SkillId = skill.Id,
                Level = 0
            });
        }

        await _db.SaveChangesAsync();

        var token = GenerateJwt(user);

        return CreatedAtAction(nameof(Login), new AuthResponse
        {
            Token = token,
            User = MapUserToDto(user, 100)
        });
    }

    // ── Helpers ────────────────────────────────────────────────

    private UserDto MapUserToDto(User user, int maxXp)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Level = user.Level,
            Xp = user.Xp,
            MaxXp = maxXp,
            Streak = user.Streak,
            BadgesEarned = user.UserAchievements?.Count ?? 0,
            Bio = user.Bio,
            GithubUrl = user.GithubUrl,
            LinkedinUrl = user.LinkedinUrl,
            IsAdmin = user.IsAdmin,
            Tokens = user.Tokens,
            PhoneNumber = user.PhoneNumber,
            EducationLevel = user.EducationLevel,
            FieldOfStudy = user.FieldOfStudy
        };
    }

    private static bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
    }

    private string GenerateJwt(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "SmartCareerRoadmapSuperSecretKey2026!"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "SmartCareerRoadmap",
            audience: _config["Jwt:Audience"] ?? "SmartCareerRoadmap",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static int CalculateMaxXp(int level)
    {
        // Base 3000 XP, scales 1.25x per level
        int maxXp = 3000;
        for (int i = 1; i < level; i++)
            maxXp = (int)Math.Round(maxXp * 1.25);
        return maxXp;
    }
}
