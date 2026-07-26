using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.Models;

namespace SmartCareerRoadmap.API.Controllers;

/// <summary>
/// Development-only controller to re-seed database with properly hashed passwords.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SeedController : ControllerBase
{
    private readonly AppDbContext _db;

    public SeedController(AppDbContext db) => _db = db;

    /// <summary>POST /api/seed/fix-password — hash the seed user's password properly</summary>
    [HttpPost("fix-password")]
    public async Task<IActionResult> FixSeedPassword()
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == "admin@gmail.com");
        if (user == null)
        {
            user = new SmartCareerRoadmap.API.Models.User
            {
                Name = "Guild Master Admin",
                Email = "admin@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123"),
                IsAdmin = true
            };
            _db.Users.Add(user);
        }
        else
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123");
            user.IsAdmin = true;
        }

        // Make sure savan is no longer admin
        var savan = await _db.Users.FirstOrDefaultAsync(u => u.Email == "savan@guild.com");
        if (savan != null) {
            savan.IsAdmin = false;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Admin user admin@gmail.com created/updated successfully.", email = user.Email });
    }

    /// <summary>POST /api/seed/run-init — Drop and recreate tables, inserting seed data from init.sql</summary>
    [HttpPost("run-init")]
    public async Task<IActionResult> RunInitSql()
    {
        var sqlPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "database", "init.sql");
        if (!System.IO.File.Exists(sqlPath))
            return NotFound(new { message = "init.sql not found at " + sqlPath });
            
        var sql = await System.IO.File.ReadAllTextAsync(sqlPath);
        await _db.Database.ExecuteSqlRawAsync(sql);
        
        return Ok(new { message = "Database reset and seeded successfully from init.sql" });
    }
}
