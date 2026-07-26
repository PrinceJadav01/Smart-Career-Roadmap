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
public class WeeklyQuestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public WeeklyQuestsController(AppDbContext db) => _db = db;

    // ── Get Active Weekly Quest (with options, hidden correct answer) ──
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveQuest()
    {
        var activeQuest = await _db.WeeklyQuests
            .Include(q => q.Questions)
            .Where(q => q.EndDate > DateTime.UtcNow)
            .OrderBy(q => q.EndDate)
            .FirstOrDefaultAsync();

        if (activeQuest == null)
            return NotFound("No active quest this week.");

        // Check if user already submitted
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        bool alreadySubmitted = false;
        QuestSubmission? userSubmission = null;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            userSubmission = await _db.QuestSubmissions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.WeeklyQuestId == activeQuest.Id);
            alreadySubmitted = userSubmission != null;
        }

        // Return questions without the correct option to prevent cheating
        var questionsPayload = activeQuest.Questions.Select(q => new
        {
            q.Id,
            q.QuestionText,
            q.OptionA,
            q.OptionB,
            q.OptionC,
            q.OptionD,
            q.Points
        });

        return Ok(new
        {
            activeQuest.Id,
            activeQuest.Title,
            activeQuest.Description,
            activeQuest.EndDate,
            activeQuest.RewardTokens,
            Questions = questionsPayload,
            AlreadySubmitted = alreadySubmitted,
            UserSubmission = userSubmission != null ? new { userSubmission.Score, userSubmission.DurationSeconds, userSubmission.TokensEarned } : null
        });
    }

    // ── Submit Quiz ──
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmissionRequest req)
    {
        var quest = await _db.WeeklyQuests
            .Include(q => q.Questions)
            .FirstOrDefaultAsync(q => q.Id == req.WeeklyQuestId);

        if (quest == null)
            return NotFound("Quest not found.");

        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var existingSubmission = await _db.QuestSubmissions
            .AnyAsync(s => s.UserId == userId && s.WeeklyQuestId == req.WeeklyQuestId);
        if (existingSubmission)
            return BadRequest("You have already submitted this week's quest.");

        // Calculate score
        int totalScore = 0;
        int maxPossible = 0;

        foreach (var question in quest.Questions)
        {
            maxPossible += question.Points;
            if (req.Answers.TryGetValue(question.Id, out var userAnswer))
            {
                if (userAnswer.Trim().Equals(question.CorrectOption.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    totalScore += question.Points;
                }
            }
        }

        // Calculate token reward based on accuracy percentage
        double accuracy = maxPossible > 0 ? (double)totalScore / maxPossible : 0;
        int tokensEarned = (int)Math.Round(accuracy * quest.RewardTokens);

        // Save submission
        var submission = new QuestSubmission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            WeeklyQuestId = req.WeeklyQuestId,
            Score = totalScore,
            DurationSeconds = req.DurationSeconds,
            SubmittedAt = DateTime.UtcNow,
            TokensEarned = tokensEarned
        };

        _db.QuestSubmissions.Add(submission);

        // Add tokens to user account
        var user = await _db.Users.FindAsync(userId);
        if (user != null)
        {
            user.Tokens += tokensEarned;
            // Also award some profile XP for completing weekly quests
            user.Xp += totalScore * 2; // e.g. 100 points = 200 XP
            int maxXp = CalculateMaxXp(user.Level);
            while (user.Xp >= maxXp)
            {
                user.Xp -= maxXp;
                user.Level += 1;
                maxXp = CalculateMaxXp(user.Level);
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            Score = totalScore,
            MaxScore = maxPossible,
            TokensEarned = tokensEarned,
            DurationSeconds = req.DurationSeconds
        });
    }

    // ── Get Leaderboard ──
    [HttpGet("leaderboard/{questId:guid}")]
    public async Task<IActionResult> GetLeaderboard(Guid questId)
    {
        var submissions = await _db.QuestSubmissions
            .Include(s => s.User)
            .Where(s => s.WeeklyQuestId == questId)
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.DurationSeconds)
            .Take(10)
            .ToListAsync();

        var result = submissions.Select((s, index) => new
        {
            Rank = index + 1,
            UserName = s.User?.Name ?? "Anonymous",
            s.Score,
            s.DurationSeconds,
            s.SubmittedAt
        });

        return Ok(result);
    }

    private static int CalculateMaxXp(int level)
    {
        int maxXp = 3000;
        for (int i = 1; i < level; i++)
            maxXp = (int)Math.Round(maxXp * 1.25);
        return maxXp;
    }
}

public class QuizSubmissionRequest
{
    public Guid WeeklyQuestId { get; set; }
    public Dictionary<Guid, string> Answers { get; set; } = new();
    public int DurationSeconds { get; set; }
}
