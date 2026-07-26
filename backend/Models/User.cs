using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Column("password_hash")]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("level")]
    public int Level { get; set; } = 1;

    [Column("xp")]
    public int Xp { get; set; } = 0;

    [Column("streak")]
    public int Streak { get; set; } = 0;

    [Column("last_active")]
    public DateTime LastActive { get; set; } = DateTime.UtcNow;

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("github_url")]
    [MaxLength(255)]
    public string? GithubUrl { get; set; }

    [Column("linkedin_url")]
    [MaxLength(255)]
    public string? LinkedinUrl { get; set; }

    [Column("is_admin")]
    public bool IsAdmin { get; set; } = false;

    [Column("tokens")]
    public int Tokens { get; set; } = 0;

    [Column("phone_number")]
    [MaxLength(15)]
    public string? PhoneNumber { get; set; }

    [Column("education_level")]
    [MaxLength(50)]
    public string? EducationLevel { get; set; }

    [Column("field_of_study")]
    [MaxLength(100)]
    public string? FieldOfStudy { get; set; }

    // Navigation properties
    public ICollection<UserSkill> UserSkills { get; set; } = new List<UserSkill>();
    public ActiveQuest? ActiveQuest { get; set; }
    public ICollection<UserAchievement> UserAchievements { get; set; } = new List<UserAchievement>();
    public ICollection<UserResource> UserResources { get; set; } = new List<UserResource>();
    public ICollection<CompletedQuest> CompletedQuests { get; set; } = new List<CompletedQuest>();
}
