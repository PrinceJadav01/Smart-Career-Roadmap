using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SmartCareerRoadmap.API.Models;

[Table("quest_submissions")]
public class QuestSubmission
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("user_id")]
    public Guid UserId { get; set; }

    [Column("weekly_quest_id")]
    public Guid WeeklyQuestId { get; set; }

    [Column("score")]
    public int Score { get; set; }

    [Column("duration_seconds")]
    public int DurationSeconds { get; set; }

    [Column("submitted_at")]
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    [Column("tokens_earned")]
    public int TokensEarned { get; set; }

    // Navigation properties
    public User? User { get; set; }
    
    [JsonIgnore]
    public WeeklyQuest? WeeklyQuest { get; set; }
}
