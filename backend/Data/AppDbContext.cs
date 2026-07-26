using Microsoft.EntityFrameworkCore;
using SmartCareerRoadmap.API.Models;

namespace SmartCareerRoadmap.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<UserSkill> UserSkills => Set<UserSkill>();
    public DbSet<CareerRole> CareerRoles => Set<CareerRole>();
    public DbSet<RoleRequirement> RoleRequirements => Set<RoleRequirement>();
    public DbSet<ActiveQuest> ActiveQuests => Set<ActiveQuest>();
    public DbSet<LearningResource> LearningResources => Set<LearningResource>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();
    public DbSet<UserResource> UserResources => Set<UserResource>();
    public DbSet<CompletedQuest> CompletedQuests => Set<CompletedQuest>();
    public DbSet<WeeklyQuest> WeeklyQuests => Set<WeeklyQuest>();
    public DbSet<QuestQuestion> QuestQuestions => Set<QuestQuestion>();
    public DbSet<QuestSubmission> QuestSubmissions => Set<QuestSubmission>();
    public DbSet<RedeemableReward> RedeemableRewards => Set<RedeemableReward>();
    public DbSet<UserRedemption> UserRedemptions => Set<UserRedemption>();
    public DbSet<AdminAuditLog> AdminAuditLogs => Set<AdminAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ──────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // ── UserSkills ─────────────────────────────────────────
        modelBuilder.Entity<UserSkill>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.SkillId }).IsUnique();

            entity.HasOne(us => us.User)
                  .WithMany(u => u.UserSkills)
                  .HasForeignKey(us => us.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(us => us.Skill)
                  .WithMany(s => s.UserSkills)
                  .HasForeignKey(us => us.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── RoleRequirements ───────────────────────────────────
        modelBuilder.Entity<RoleRequirement>(entity =>
        {
            entity.HasIndex(e => new { e.RoleId, e.SkillId }).IsUnique();

            entity.HasOne(rr => rr.CareerRole)
                  .WithMany(cr => cr.RoleRequirements)
                  .HasForeignKey(rr => rr.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(rr => rr.Skill)
                  .WithMany(s => s.RoleRequirements)
                  .HasForeignKey(rr => rr.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ActiveQuests ───────────────────────────────────────
        modelBuilder.Entity<ActiveQuest>(entity =>
        {
            entity.HasIndex(e => e.UserId).IsUnique();

            entity.HasOne(aq => aq.User)
                  .WithOne(u => u.ActiveQuest)
                  .HasForeignKey<ActiveQuest>(aq => aq.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(aq => aq.CareerRole)
                  .WithMany()
                  .HasForeignKey(aq => aq.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── LearningResources ──────────────────────────────────
        modelBuilder.Entity<LearningResource>(entity =>
        {
            entity.HasOne(lr => lr.Skill)
                  .WithMany(s => s.LearningResources)
                  .HasForeignKey(lr => lr.SkillId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserAchievements ───────────────────────────────────
        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.AchievementKey }).IsUnique();

            entity.HasOne(ua => ua.User)
                  .WithMany(u => u.UserAchievements)
                  .HasForeignKey(ua => ua.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserResources ──────────────────────────────────────
        modelBuilder.Entity<UserResource>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.ResourceId }).IsUnique();

            entity.HasOne(ur => ur.User)
                  .WithMany(u => u.UserResources)
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Resource)
                  .WithMany()
                  .HasForeignKey(ur => ur.ResourceId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── CompletedQuests ────────────────────────────────────
        modelBuilder.Entity<CompletedQuest>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.RoleId }).IsUnique();

            entity.HasOne(cq => cq.User)
                  .WithMany(u => u.CompletedQuests)
                  .HasForeignKey(cq => cq.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(cq => cq.CareerRole)
                  .WithMany()
                  .HasForeignKey(cq => cq.RoleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── QuestQuestions ─────────────────────────────────────
        modelBuilder.Entity<QuestQuestion>(entity =>
        {
            entity.HasOne(qq => qq.WeeklyQuest)
                  .WithMany(wq => wq.Questions)
                  .HasForeignKey(qq => qq.WeeklyQuestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── QuestSubmissions ───────────────────────────────────
        modelBuilder.Entity<QuestSubmission>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.WeeklyQuestId }).IsUnique();

            entity.HasOne(qs => qs.User)
                  .WithMany()
                  .HasForeignKey(qs => qs.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(qs => qs.WeeklyQuest)
                  .WithMany(wq => wq.Submissions)
                  .HasForeignKey(qs => qs.WeeklyQuestId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserRedemptions ────────────────────────────────────
        modelBuilder.Entity<UserRedemption>(entity =>
        {
            entity.HasOne(ur => ur.User)
                  .WithMany()
                  .HasForeignKey(ur => ur.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(ur => ur.Reward)
                  .WithMany()
                  .HasForeignKey(ur => ur.RewardId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
