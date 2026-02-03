using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("UsageRecords")]
public class UsageRecord
{
	[Key]
	public uint Id { get; set; }

	public DateTime Timestamp { get; set; }

	public byte StoryPointsByte { get; set; }

	public byte NewStoryPointsByte { get; set; }

	public bool IsAiUsed { get; set; }

	public ushort TimeSpent { get; set; }

	public ushort TimeSaved { get; set; }
}
