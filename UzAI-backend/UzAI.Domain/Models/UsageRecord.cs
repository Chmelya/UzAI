using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("UsageRecords")]
public class UsageRecord
{
	[Key]
	public uint Id { get; set; }

	public DateTime Timestamp { get; set; }

	public uint TicketId { get; set; }
	public Ticket Ticket { get; set; } = null!;

	public uint EmployeeId { get; set; }
	public Employee Employee { get; set; } = null!;

	[Column("Category")]
	public TicketCategory Category { get; set; }

	[Column("StoryPointsByte")]
	public StoryPoints StoryPoints { get; set; }

	[Column("NewStoryPointsByte")]
	public StoryPoints NewStoryPoints { get; set; }

	public bool IsAiUsed { get; set; }

	public ushort TimeSpent { get; set; }

	/// <summary>Time saved (minutes). Can be negative when task took longer than estimated.</summary>
	public short TimeSaved { get; set; }
}
