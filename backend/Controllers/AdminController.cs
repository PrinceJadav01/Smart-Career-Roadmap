using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.Models;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;

    public AdminController(AppDbContext db, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
    }

    private async Task<User?> GetRequestingAdmin()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return null;

        var user = await _db.Users.FindAsync(userId);
        return (user != null && user.IsAdmin) ? user : null;
    }

    private async Task LogAdminAction(User admin, string action, string details)
    {
        var log = new AdminAuditLog
        {
            Id = Guid.NewGuid(),
            AdminId = admin.Id,
            AdminName = admin.Name,
            Action = action,
            Details = details,
            Timestamp = DateTime.UtcNow
        };
        _db.AdminAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    // ── Telemetry & Health Checks ──

    [HttpGet("health")]
    public async Task<IActionResult> GetSystemHealth()
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var client = _httpClientFactory.CreateClient();
        bool mlOnline = false;
        long mlLatencyMs = 0;

        try
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var response = await client.GetAsync("http://localhost:8000/docs"); // FastAPI docs path
            sw.Stop();
            mlOnline = response.IsSuccessStatusCode;
            mlLatencyMs = sw.ElapsedMilliseconds;
        }
        catch { }

        bool dbOnline = false;
        try
        {
            dbOnline = await _db.Database.CanConnectAsync();
        }
        catch { }

        return Ok(new
        {
            GatewayOnline = true,
            DatabaseOnline = dbOnline,
            MlServiceOnline = mlOnline,
            MlLatency = mlLatencyMs,
            ServerTime = DateTime.UtcNow
        });
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var logs = await _db.AdminAuditLogs
            .OrderByDescending(l => l.Timestamp)
            .Take(100)
            .ToListAsync();

        return Ok(logs);
    }

    // ── User Management ──

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var users = await _db.Users
            .Include(u => u.ActiveQuest).ThenInclude(aq => aq.CareerRole)
            .Include(u => u.UserSkills).ThenInclude(us => us.Skill)
            .OrderBy(u => u.Name)
            .ToListAsync();

        // Also fetch user redemption history and quest submission count
        var redemptions = await _db.UserRedemptions.Include(r => r.Reward).ToListAsync();
        var submissions = await _db.QuestSubmissions.ToListAsync();

        var result = users.Select(u => new
        {
            u.Id,
            u.Name,
            u.Email,
            u.Level,
            u.Xp,
            u.Streak,
            u.IsAdmin,
            u.Tokens,
            ActiveQuest = u.ActiveQuest != null ? new { u.ActiveQuest.RoleId, RoleName = u.ActiveQuest.CareerRole?.Name } : null,
            Skills = u.UserSkills.Select(us => new { us.SkillId, us.Skill?.Name, us.Level }),
            Redemptions = redemptions.Where(r => r.UserId == u.Id).Select(r => new { r.RewardId, Title = r.Reward?.Title, r.RedeemedAt }),
            QuestsCompleted = submissions.Count(s => s.UserId == u.Id)
        });

        return Ok(result);
    }

    [HttpPost("users/{id:guid}/tokens")]
    public async Task<IActionResult> UpdateUserTokens(Guid id, [FromBody] TokenUpdateRequest req)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        int oldTokens = user.Tokens;
        user.Tokens = req.Amount;
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "USER_TOKEN_ADJUST", $"Adjusted tokens for {user.Name} from {oldTokens} to {req.Amount}. Reason: {req.Reason}");

        return Ok(new { message = "Tokens updated successfully.", tokens = user.Tokens });
    }

    [HttpPost("users/{id:guid}/toggle-admin")]
    public async Task<IActionResult> ToggleAdmin(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        if (user.Id == admin.Id)
            return BadRequest("You cannot revoke your own admin rights.");

        user.IsAdmin = !user.IsAdmin;
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "USER_ADMIN_TOGGLE", $"Toggled Admin privileges for user {user.Name}. New Status: {user.IsAdmin}");

        return Ok(new { message = "Admin role updated successfully.", isAdmin = user.IsAdmin });
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("User not found.");

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "USER_DELETE", $"Wiped adventurer registry for user {user.Name} ({user.Email}).");

        return Ok(new { message = "User deleted successfully." });
    }

    // ── Learning Resources (Courses) CRUD ──

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse([FromBody] LearningResource resource)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        if (resource.Id == Guid.Empty) resource.Id = Guid.NewGuid();
        _db.LearningResources.Add(resource);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "COURSE_ADD", $"Added new learning resource: '{resource.Title}' to skill catalog.");

        return Ok(resource);
    }

    [HttpPut("courses/{id:guid}")]
    public async Task<IActionResult> UpdateCourse(Guid id, [FromBody] LearningResource resource)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var existing = await _db.LearningResources.FindAsync(id);
        if (existing == null) return NotFound("Course not found.");

        existing.Title = resource.Title;
        existing.Platform = resource.Platform;
        existing.Url = resource.Url;
        existing.Duration = resource.Duration;
        existing.Cost = resource.Cost;
        existing.SkillId = resource.SkillId;

        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "COURSE_UPDATE", $"Curated learning resource: '{resource.Title}'.");

        return Ok(existing);
    }

    [HttpDelete("courses/{id:guid}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var resource = await _db.LearningResources.FindAsync(id);
        if (resource == null) return NotFound("Course not found.");

        _db.LearningResources.Remove(resource);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "COURSE_DELETE", $"Removed course item '{resource.Title}' from armory.");

        return Ok(new { message = "Course deleted successfully." });
    }

    // ── Career Roles CRUD ──

    [HttpPost("careers")]
    public async Task<IActionResult> CreateCareer([FromBody] CareerRole role)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        if (role.Id == Guid.Empty) role.Id = Guid.NewGuid();
        _db.CareerRoles.Add(role);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "ROLE_ADD", $"Published new career role '{role.Name}' on target board.");

        return Ok(role);
    }

    [HttpPut("careers/{id:guid}")]
    public async Task<IActionResult> UpdateCareer(Guid id, [FromBody] CareerRole role)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var existing = await _db.CareerRoles.FindAsync(id);
        if (existing == null) return NotFound("Role not found.");

        existing.Name = role.Name;
        existing.Demand = role.Demand;
        existing.SalaryRange = role.SalaryRange;

        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "ROLE_UPDATE", $"Updated career role specifications for '{role.Name}'.");

        return Ok(existing);
    }

    [HttpDelete("careers/{id:guid}")]
    public async Task<IActionResult> DeleteCareer(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var role = await _db.CareerRoles.FindAsync(id);
        if (role == null) return NotFound("Role not found.");

        _db.CareerRoles.Remove(role);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "ROLE_DELETE", $"De-listed career role '{role.Name}'.");

        return Ok(new { message = "Role deleted successfully." });
    }

    // ── Weekly Quests & Questions CRUD ──

    [HttpGet("quests")]
    public async Task<IActionResult> GetQuests()
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var quests = await _db.WeeklyQuests
            .Include(q => q.Questions)
            .OrderByDescending(q => q.EndDate)
            .ToListAsync();

        return Ok(quests);
    }

    [HttpPost("quests")]
    public async Task<IActionResult> CreateQuest([FromBody] WeeklyQuest quest)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        if (quest.Id == Guid.Empty) quest.Id = Guid.NewGuid();
        _db.WeeklyQuests.Add(quest);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "QUEST_ADD", $"Launched weekly trial quest '{quest.Title}' with pool 🪙 {quest.RewardTokens}.");

        return Ok(quest);
    }

    [HttpPut("quests/{id:guid}")]
    public async Task<IActionResult> UpdateQuest(Guid id, [FromBody] WeeklyQuest quest)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var existing = await _db.WeeklyQuests.FindAsync(id);
        if (existing == null) return NotFound("Quest not found.");

        existing.Title = quest.Title;
        existing.Description = quest.Description;
        existing.EndDate = quest.EndDate;
        existing.RewardTokens = quest.RewardTokens;

        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "QUEST_UPDATE", $"Refined weekly trial specifications for '{quest.Title}'.");

        return Ok(existing);
    }

    [HttpDelete("quests/{id:guid}")]
    public async Task<IActionResult> DeleteQuest(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var quest = await _db.WeeklyQuests.FindAsync(id);
        if (quest == null) return NotFound("Quest not found.");

        _db.WeeklyQuests.Remove(quest);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "QUEST_DELETE", $"Recalled weekly trial '{quest.Title}' from rotation.");

        return Ok(new { message = "Quest deleted successfully." });
    }

    [HttpPost("quests/{questId:guid}/questions")]
    public async Task<IActionResult> AddQuestion(Guid questId, [FromBody] QuestQuestion question)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var quest = await _db.WeeklyQuests.FindAsync(questId);
        if (quest == null) return NotFound("Quest not found.");

        if (question.Id == Guid.Empty) question.Id = Guid.NewGuid();
        question.WeeklyQuestId = questId;

        _db.QuestQuestions.Add(question);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "QUEST_QUESTION_ADD", $"Inserted MCQ item into Weekly Trial: '{quest.Title}'.");

        return Ok(question);
    }

    [HttpDelete("questions/{id:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var question = await _db.QuestQuestions.FindAsync(id);
        if (question == null) return NotFound("Question not found.");

        _db.QuestQuestions.Remove(question);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "QUEST_QUESTION_DELETE", $"Deleted question item from weekly quest rotation.");

        return Ok(new { message = "Question deleted successfully." });
    }

    // ── Shop Rewards CRUD ──

    [HttpPost("rewards")]
    public async Task<IActionResult> CreateReward([FromBody] RedeemableReward reward)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        if (reward.Id == Guid.Empty) reward.Id = Guid.NewGuid();
        _db.RedeemableRewards.Add(reward);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "REWARD_ADD", $"Placed '{reward.Title}' in Reward Merchant vault for 🪙 {reward.TokenCost}.");

        return Ok(reward);
    }

    [HttpPut("rewards/{id:guid}")]
    public async Task<IActionResult> UpdateReward(Guid id, [FromBody] RedeemableReward reward)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var existing = await _db.RedeemableRewards.FindAsync(id);
        if (existing == null) return NotFound("Reward not found.");

        existing.Title = reward.Title;
        existing.Description = reward.Description;
        existing.TokenCost = reward.TokenCost;
        existing.ImageUrl = reward.ImageUrl;
        existing.RewardUrl = reward.RewardUrl;

        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "REWARD_UPDATE", $"Modified specifications for reward catalog item '{reward.Title}'.");

        return Ok(existing);
    }

    [HttpDelete("rewards/{id:guid}")]
    public async Task<IActionResult> DeleteReward(Guid id)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var reward = await _db.RedeemableRewards.FindAsync(id);
        if (reward == null) return NotFound("Reward not found.");

        _db.RedeemableRewards.Remove(reward);
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "REWARD_DELETE", $"Recalled reward item '{reward.Title}' from merchant catalogs.");

        return Ok(new { message = "Reward deleted successfully." });
    }

    // ── Reward Orders & Delivery Fulfillment Module ──

    [HttpGet("orders")]
    public async Task<IActionResult> GetRewardOrders()
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var redemptions = await _db.UserRedemptions
            .Include(ur => ur.User)
            .Include(ur => ur.Reward)
            .OrderByDescending(ur => ur.RedeemedAt)
            .ToListAsync();

        var result = redemptions.Select(ur => new
        {
            ur.Id,
            ur.OrderId,
            ur.UserId,
            UserName = ur.User?.Name ?? "Anonymous",
            UserEmail = ur.User?.Email ?? "N/A",
            ur.RewardId,
            RewardTitle = ur.Reward?.Title ?? "Custom Item",
            RewardImageUrl = ur.Reward?.ImageUrl ?? "",
            TokenCost = ur.Reward?.TokenCost ?? 0,
            ur.FullName,
            ur.PhoneNumber,
            ur.ShippingAddress,
            ur.Status,
            ur.RedeemedAt
        });

        return Ok(result);
    }

    [HttpPut("orders/{id:guid}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] OrderStatusUpdateRequest req)
    {
        var admin = await GetRequestingAdmin();
        if (admin == null) return Forbid("Admin permissions required.");

        var redemption = await _db.UserRedemptions
            .Include(ur => ur.Reward)
            .Include(ur => ur.User)
            .FirstOrDefaultAsync(ur => ur.Id == id);

        if (redemption == null) return NotFound("Order not found.");

        string oldStatus = redemption.Status;
        redemption.Status = req.Status;
        await _db.SaveChangesAsync();

        await LogAdminAction(admin, "ORDER_STATUS_UPDATE", $"Updated Order #{redemption.OrderId} status from '{oldStatus}' to '{req.Status}'.");

        return Ok(new
        {
            message = $"Order status updated to '{req.Status}'.",
            redemption.Id,
            redemption.OrderId,
            redemption.Status
        });
    }
}

public class OrderStatusUpdateRequest
{
    public string Status { get; set; } = "Waiting";
}

public class TokenUpdateRequest
{
    public int Amount { get; set; }
    public string Reason { get; set; } = "Gifted by Admin";
}
