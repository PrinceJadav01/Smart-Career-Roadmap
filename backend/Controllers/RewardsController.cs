using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Data;
using SmartCareerRoadmap.API.Models;
using System.Security.Claims;

namespace SmartCareerRoadmap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RewardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RewardsController(AppDbContext db) => _db = db;

    // ── Get Rewards List & User Redemptions ──
    [HttpGet]
    public async Task<IActionResult> GetRewards()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var rewards = await _db.RedeemableRewards.ToListAsync();
        
        var userRedemptions = await _db.UserRedemptions
            .Include(ur => ur.Reward)
            .Where(ur => ur.UserId == userId)
            .OrderByDescending(ur => ur.RedeemedAt)
            .ToListAsync();

        return Ok(new
        {
            Catalog = rewards,
            Inventory = userRedemptions.Select(ur => new
            {
                ur.Id,
                ur.RewardId,
                Title = ur.Reward?.Title,
                Description = ur.Reward?.Description,
                RewardUrl = ur.Reward?.RewardUrl,
                ur.RedeemedAt
            })
        });
    }

    // ── Redeem Reward ──
    [HttpPost("redeem/{rewardId:guid}")]
    public async Task<IActionResult> RedeemReward(Guid rewardId)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var reward = await _db.RedeemableRewards.FindAsync(rewardId);
        if (reward == null)
            return NotFound("Reward not found.");

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        if (user.Tokens < reward.TokenCost)
            return BadRequest(new { message = "Insufficient tokens." });

        // Check if user already redeemed (if rewards are unique/one-time, which real-world review slots typically are)
        var alreadyRedeemed = await _db.UserRedemptions
            .AnyAsync(ur => ur.UserId == userId && ur.RewardId == rewardId);
        if (alreadyRedeemed)
            return BadRequest(new { message = "You have already redeemed this reward." });

        // Process transaction
        user.Tokens -= reward.TokenCost;

        var redemption = new UserRedemption
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RewardId = rewardId,
            RedeemedAt = DateTime.UtcNow
        };

        _db.UserRedemptions.Add(redemption);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Reward redeemed successfully!",
            user.Tokens,
            Redemption = new
            {
                redemption.Id,
                redemption.RewardId,
                reward.Title,
                reward.Description,
                reward.RewardUrl,
                redemption.RedeemedAt
            }
        });
    }
}
