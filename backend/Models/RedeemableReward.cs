using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("redeemable_rewards")]
public class RedeemableReward
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("title")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("token_cost")]
    public int TokenCost { get; set; }

    [Column("reward_url")]
    public string RewardUrl { get; set; } = string.Empty;
}
