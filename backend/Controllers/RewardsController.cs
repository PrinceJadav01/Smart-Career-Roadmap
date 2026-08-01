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

        // ── SERVER-SIDE FORM VALIDATIONS ──
        if (req == null)
            return BadRequest(new { message = "Shipping details are required." });

        // 1. Full Name Validation (at least 2 characters)
        var fullName = req.FullName?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(fullName) || fullName.Length < 2)
            return BadRequest(new { message = "Full Name must be at least 2 characters long." });

        if (fullName.Length > 100)
            return BadRequest(new { message = "Full Name cannot exceed 100 characters." });

        // 2. Contact Phone Number Validation (Must be exactly 10 digits)
        var rawPhone = req.PhoneNumber?.Trim() ?? "";
        var digitsOnly = System.Text.RegularExpressions.Regex.Replace(rawPhone, @"\D", "");
        if (digitsOnly.StartsWith("91") && digitsOnly.Length == 12)
        {
            digitsOnly = digitsOnly[2..]; // Strip country code +91
        }

        if (digitsOnly.Length != 10)
            return BadRequest(new { message = "Contact Phone Number must be a valid 10-digit mobile number (e.g., 9876543210)." });

        // 3. Shipping Address Validation (at least 10 characters)
        var shippingAddr = req.ShippingAddress?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(shippingAddr) || shippingAddr.Length < 10)
            return BadRequest(new { message = "Please provide a complete shipping address (at least 10 characters including street, city, pincode)." });

        if (shippingAddr.Length > 500)
            return BadRequest(new { message = "Shipping address cannot exceed 500 characters." });

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
            FullName = fullName,
            PhoneNumber = digitsOnly,
            ShippingAddress = shippingAddr,
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
