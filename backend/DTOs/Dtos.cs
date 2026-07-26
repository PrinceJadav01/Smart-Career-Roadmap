using System.ComponentModel.DataAnnotations;

namespace SmartCareerRoadmap.API.DTOs;

// ── Auth ───────────────────────────────────────────────────
public class LoginRequest
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Confirm password is required.")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Invalid phone number.")]
    public string? PhoneNumber { get; set; }

    public string? EducationLevel { get; set; }
    public string? FieldOfStudy { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

// ── User ───────────────────────────────────────────────────
public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int Level { get; set; }
    public int Xp { get; set; }
    public int MaxXp { get; set; }
    public int Streak { get; set; }
    public int BadgesEarned { get; set; }
    public string? Bio { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public bool IsAdmin { get; set; }
    public int Tokens { get; set; }
    public string? PhoneNumber { get; set; }
    public string? EducationLevel { get; set; }
    public string? FieldOfStudy { get; set; }
}

public class UserUpdateRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedinUrl { get; set; }
}

// ── Skills ─────────────────────────────────────────────────
public class SkillDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public string Category { get; set; } = string.Empty;
}

public class SkillUpdateRequest
{
    public int Level { get; set; }
}

public class SkillCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

// ── Careers ────────────────────────────────────────────────
public class CareerRoleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Demand { get; set; } = string.Empty;
    public string Salary { get; set; } = string.Empty;
    public List<RoleRequirementDto> Requirements { get; set; } = new();
}

public class RoleRequirementDto
{
    public string Skill { get; set; } = string.Empty;
    public int Importance { get; set; }
}

// ── Quests ─────────────────────────────────────────────────
public class QuestDto
{
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public int ProgressPercent { get; set; }
    public bool IsCompleted { get; set; }
}

public class QuestRequest
{
    public Guid RoleId { get; set; }
}

// ── Resources ──────────────────────────────────────────────
public class ResourceDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public string? Cost { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}

public class ResourceProgressRequest
{
    public bool IsCompleted { get; set; }
}

public class ResourceCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public string? Cost { get; set; }
    public string SkillName { get; set; } = string.Empty;
}

// ── Achievements ───────────────────────────────────────────
public class AchievementDto
{
    public string AchievementKey { get; set; } = string.Empty;
    public DateTime? UnlockedAt { get; set; }
}

public class UnlockAchievementRequest
{
    public string AchievementKey { get; set; } = string.Empty;
}
