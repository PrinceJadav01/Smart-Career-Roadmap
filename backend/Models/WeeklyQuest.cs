using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("weekly_quests")]
public class WeeklyQuest
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("title")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("reward_tokens")]
    public int RewardTokens { get; set; } = 100;

    // Navigation properties
    public ICollection<QuestQuestion> Questions { get; set; } = new List<QuestQuestion>();
    public ICollection<QuestSubmission> Submissions { get; set; } = new List<QuestSubmission>();
}
