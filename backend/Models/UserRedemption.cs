using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("user_redemptions")]
public class UserRedemption
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("reward_id")]
    public Guid RewardId { get; set; }

    [Column("redeemed_at")]
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public RedeemableReward? Reward { get; set; }
}
