using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("UsageRecords")]
public class UsageRecord
{
	[Key]
	public uint Id { get; set; }

	public DateTime Timestamp { get; set; }

	[Column("StoryPointsByte")]
	public StoryPoints StoryPoints { get; set; }

	[Column("NewStoryPointsByte")]
	public StoryPoints NewStoryPoints { get; set; }

	public bool IsAiUsed { get; set; }

	public ushort TimeSpent { get; set; }

	/// <summary>Time saved (minutes). Can be negative when task took longer than estimated.</summary>
	public short TimeSaved { get; set; }
}
