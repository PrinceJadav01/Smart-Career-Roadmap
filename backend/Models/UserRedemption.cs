using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("user_redemptions")]
public class UserRedemption
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("order_id")]
    [MaxLength(50)]
    public string OrderId { get; set; } = string.Empty;

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("reward_id")]
    public Guid RewardId { get; set; }

    [Column("full_name")]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [Column("phone_number")]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Column("shipping_address")]
    public string ShippingAddress { get; set; } = string.Empty;

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Waiting"; // "Waiting", "Dispatched", "Delivered"

    [Column("redeemed_at")]
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public RedeemableReward? Reward { get; set; }
}
