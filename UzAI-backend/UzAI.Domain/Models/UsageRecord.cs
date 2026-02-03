using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("UsageRecords")]
public class UsageRecord
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    [MaxLength(100)]
    public string? Action { get; set; }

    public int? Quantity { get; set; }
}
