using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SmartCareerRoadmap.API.Data;

var builder = WebApplication.CreateBuilder(args);

// ── Dynamic Port Binding for Render Cloud Hosting ─────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── Database (PostgreSQL via EF Core) ──────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── JWT Authentication ─────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SmartCareerRoadmapSuperSecretKey2026!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "SmartCareerRoadmap",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "SmartCareerRoadmap",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddHttpClient();

// ── Controllers & OpenAPI ──────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// ── CORS (allow React dev server & Vercel production) ─────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ── Auto-ensure database schema columns & Admin User ──────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await db.Database.ExecuteSqlRawAsync(@"
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
        ");

        var adminUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "admin@gmail.com");
        if (adminUser == null)
        {
            adminUser = new SmartCareerRoadmap.API.Models.User
            {
                Id = Guid.NewGuid(),
                Name = "Savan Chauhan (Admin)",
                Email = "admin@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123"),
                IsAdmin = true,
                Level = 5,
                Xp = 2500,
                Tokens = 500,
                Streak = 7,
                Bio = "System Administrator & Lead Engineer",
                EducationLevel = "Bachelor's Degree",
                FieldOfStudy = "Computer Engineering"
            };
            db.Users.Add(adminUser);
        }
        else
        {
            adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123");
            adminUser.IsAdmin = true;
        }
        await db.SaveChangesAsync();
        Console.WriteLine("[DB Seeder]: Default Admin Account (admin@gmail.com / admin@123) synced successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Schema Migration Warning]: {ex.Message}");
    }
}

// ── Middleware Pipeline ────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Root Health Check Route ──────────────────────────────────
app.MapGet("/", () => Results.Ok(new
{
    status = "online",
    service = "SkillSathi Smart Career Roadmap Backend API",
    timestamp = DateTime.UtcNow
}));

app.Run();
