using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartCareerRoadmap.API.Models;

[Table("admin_audit_logs")]
public class AdminAuditLog
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("admin_id")]
    public Guid AdminId { get; set; }

    [Column("admin_name")]
    [MaxLength(100)]
    public string AdminName { get; set; } = string.Empty;

    [Column("action")]
    [MaxLength(200)]
    public string Action { get; set; } = string.Empty;

    [Column("details")]
    public string Details { get; set; } = string.Empty;

    [Column("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
