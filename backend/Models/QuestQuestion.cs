using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SmartCareerRoadmap.API.Models;

[Table("quest_questions")]
public class QuestQuestion
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("weekly_quest_id")]
    public Guid WeeklyQuestId { get; set; }

    [Column("question_text")]
    public string QuestionText { get; set; } = string.Empty;

    [Column("option_a")]
    [MaxLength(200)]
    public string OptionA { get; set; } = string.Empty;

    [Column("option_b")]
    [MaxLength(200)]
    public string OptionB { get; set; } = string.Empty;

    [Column("option_c")]
    [MaxLength(200)]
    public string OptionC { get; set; } = string.Empty;

    [Column("option_d")]
    [MaxLength(200)]
    public string OptionD { get; set; } = string.Empty;

    [Column("correct_option")]
    [MaxLength(1)] // 'A', 'B', 'C', or 'D'
    public string CorrectOption { get; set; } = string.Empty;

    [Column("points")]
    public int Points { get; set; } = 10;

    // Navigation properties
    [JsonIgnore]
    public WeeklyQuest? WeeklyQuest { get; set; }
}
