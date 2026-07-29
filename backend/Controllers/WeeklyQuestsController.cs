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
        {
            activeQuest = new WeeklyQuest
            {
                Id = Guid.NewGuid(),
                Title = "Full-Stack & System Design Sprint",
                Description = "Test your software engineering knowledge across Data Structures, Web Architecture, and REST APIs. Complete for token rewards!",
                EndDate = DateTime.UtcNow.AddDays(7),
                RewardTokens = 150,
                Questions = new List<QuestQuestion>
                {
                    new QuestQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = "Which data structure uses LIFO (Last In First Out) ordering?",
                        OptionA = "Queue",
                        OptionB = "Stack",
                        OptionC = "Linked List",
                        OptionD = "Binary Tree",
                        CorrectOption = "B",
                        Points = 10
                    },
                    new QuestQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = "What HTTP status code represents a successful resource creation in REST APIs?",
                        OptionA = "200 OK",
                        OptionB = "201 Created",
                        OptionC = "204 No Content",
                        OptionD = "400 Bad Request",
                        CorrectOption = "B",
                        Points = 10
                    },
                    new QuestQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = "What is the worst-case time complexity of QuickSort?",
                        OptionA = "O(n)",
                        OptionB = "O(n log n)",
                        OptionC = "O(n²)",
                        OptionD = "O(1)",
                        CorrectOption = "C",
                        Points = 15
                    },
                    new QuestQuestion
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = "In Relational Databases, what key uniquely identifies a row in a table?",
                        OptionA = "Foreign Key",
                        OptionB = "Index Key",
                        OptionC = "Primary Key",
                        OptionD = "Composite Foreign Key",
                        CorrectOption = "C",
                        Points = 10
                    }
                }
            };
            _db.WeeklyQuests.Add(activeQuest);
            await _db.SaveChangesAsync();
        }
        else if (activeQuest.Questions.Count == 0)
        {
            var sampleQuestions = new List<QuestQuestion>
            {
                new QuestQuestion
                {
                    Id = Guid.NewGuid(),
                    WeeklyQuestId = activeQuest.Id,
                    QuestionText = "Which data structure uses LIFO (Last In First Out) ordering?",
                    OptionA = "Queue",
                    OptionB = "Stack",
                    OptionC = "Linked List",
                    OptionD = "Binary Tree",
                    CorrectOption = "B",
                    Points = 10
                },
                new QuestQuestion
                {
                    Id = Guid.NewGuid(),
                    WeeklyQuestId = activeQuest.Id,
                    QuestionText = "What HTTP status code represents a successful resource creation in REST APIs?",
                    OptionA = "200 OK",
                    OptionB = "201 Created",
                    OptionC = "204 No Content",
                    OptionD = "400 Bad Request",
                    CorrectOption = "B",
                    Points = 10
                },
                new QuestQuestion
                {
                    Id = Guid.NewGuid(),
                    WeeklyQuestId = activeQuest.Id,
                    QuestionText = "What is the worst-case time complexity of QuickSort?",
                    OptionA = "O(n)",
                    OptionB = "O(n log n)",
                    OptionC = "O(n²)",
                    OptionD = "O(1)",
                    CorrectOption = "C",
                    Points = 15
                },
                new QuestQuestion
                {
                    Id = Guid.NewGuid(),
                    WeeklyQuestId = activeQuest.Id,
                    QuestionText = "In Relational Databases, what key uniquely identifies a row in a table?",
                    OptionA = "Foreign Key",
                    OptionB = "Index Key",
                    OptionC = "Primary Key",
                    OptionD = "Composite Foreign Key",
                    CorrectOption = "C",
                    Points = 10
                }
            };
            _db.QuestQuestions.AddRange(sampleQuestions);
            await _db.SaveChangesAsync();
            activeQuest.Questions = sampleQuestions;
        }

        // Check if user already submitted
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        bool alreadySubmitted = false;
        QuestSubmission? userSubmission = null;
        int userRank = 0;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            userSubmission = await _db.QuestSubmissions
                .FirstOrDefaultAsync(s => s.UserId == userId && s.WeeklyQuestId == activeQuest.Id);
            alreadySubmitted = userSubmission != null;

            if (userSubmission != null)
            {
                userRank = await _db.QuestSubmissions
                    .Where(s => s.WeeklyQuestId == activeQuest.Id)
                    .CountAsync(s => s.Score > userSubmission.Score || (s.Score == userSubmission.Score && s.DurationSeconds < userSubmission.DurationSeconds)) + 1;
            }
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
            UserSubmission = userSubmission != null ? new { 
                userSubmission.Score, 
                userSubmission.DurationSeconds, 
                userSubmission.TokensEarned,
                Rank = userRank
            } : null
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

        // Calculate score based on correct answers
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

        // Calculate base token reward based on accuracy percentage
        double accuracy = maxPossible > 0 ? (double)totalScore / maxPossible : 0;
        int baseTokens = (int)Math.Round(accuracy * quest.RewardTokens);

        // Determine user rank based on (Score DESC, DurationSeconds ASC) to assign Top 3 Bonus Tokens
        var betterSubmissionsCount = await _db.QuestSubmissions
            .Where(s => s.WeeklyQuestId == req.WeeklyQuestId)
            .CountAsync(s => s.Score > totalScore || (s.Score == totalScore && s.DurationSeconds < req.DurationSeconds));

        int rank = betterSubmissionsCount + 1;
        int bonusTokens = rank == 1 ? 50 : rank == 2 ? 30 : rank == 3 ? 15 : 0;
        int totalTokensEarned = baseTokens + bonusTokens;

        // Save submission
        var submission = new QuestSubmission
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            WeeklyQuestId = req.WeeklyQuestId,
            Score = totalScore,
            DurationSeconds = req.DurationSeconds,
            SubmittedAt = DateTime.UtcNow,
            TokensEarned = totalTokensEarned
        };

        _db.QuestSubmissions.Add(submission);

        // Add tokens & XP to user account
        var user = await _db.Users.FindAsync(userId);
        if (user != null)
        {
            user.Tokens += totalTokensEarned;
            user.Xp += totalScore * 2;
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
            TokensEarned = totalTokensEarned,
            BaseTokens = baseTokens,
            BonusTokens = bonusTokens,
            Rank = rank,
            DurationSeconds = req.DurationSeconds
        });
    }

    // ── Get Leaderboard ──
    [HttpGet("leaderboard/{questId:guid}")]
    public async Task<IActionResult> GetLeaderboard(Guid questId)
    {
        // Sort by Score DESC (most correct answers first), then DurationSeconds ASC (fastest completion tie-breaker)
        var submissions = await _db.QuestSubmissions
            .Include(s => s.User)
            .Where(s => s.WeeklyQuestId == questId)
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.DurationSeconds)
            .ThenBy(s => s.SubmittedAt)
            .Take(10)
            .ToListAsync();

        var result = submissions.Select((s, index) =>
        {
            int rank = index + 1;
            int bonusTokens = rank == 1 ? 50 : rank == 2 ? 30 : rank == 3 ? 15 : 0;
            return new
            {
                Rank = rank,
                UserName = s.User?.Name ?? "Anonymous",
                Score = s.Score,
                DurationSeconds = s.DurationSeconds,
                TokensEarned = s.TokensEarned,
                BonusTokens = bonusTokens,
                SubmittedAt = s.SubmittedAt
            };
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
