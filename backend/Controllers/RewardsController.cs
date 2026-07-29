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
                ur.OrderId,
                ur.RewardId,
                Title = ur.Reward?.Title,
                Description = ur.Reward?.Description,
                ImageUrl = ur.Reward?.ImageUrl,
                RewardUrl = ur.Reward?.RewardUrl,
                TokenCost = ur.Reward?.TokenCost ?? 0,
                ur.FullName,
                ur.PhoneNumber,
                ur.ShippingAddress,
                ur.Status,
                ur.RedeemedAt
            })
        });
    }

    // ── Redeem Reward ──
    [HttpPost("redeem/{rewardId:guid}")]
    public async Task<IActionResult> RedeemReward(Guid rewardId, [FromBody] RedeemRequest? req)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var reward = await _db.RedeemableRewards.FindAsync(rewardId);
        if (reward == null)
            return NotFound(new { message = "Reward not found." });

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        if (user.Tokens < reward.TokenCost)
            return BadRequest(new { message = $"Insufficient tokens. You need {reward.TokenCost} tokens but have {user.Tokens}." });

        // Generate unique Order ID
        string orderId = "ORD-" + Guid.NewGuid().ToString("N")[..6].ToUpper();

        // Process transaction
        user.Tokens -= reward.TokenCost;

        var redemption = new UserRedemption
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            UserId = userId,
            RewardId = rewardId,
            FullName = req?.FullName ?? user.Name ?? "Valued Developer",
            PhoneNumber = req?.PhoneNumber ?? user.PhoneNumber ?? "",
            ShippingAddress = req?.ShippingAddress ?? "Digital Delivery / Address on file",
            Status = "Waiting",
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
                redemption.OrderId,
                redemption.RewardId,
                reward.Title,
                reward.Description,
                reward.ImageUrl,
                reward.RewardUrl,
                redemption.FullName,
                redemption.PhoneNumber,
                redemption.ShippingAddress,
                redemption.Status,
                redemption.RedeemedAt
            }
        });
    }
}

public class RedeemRequest
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
}
