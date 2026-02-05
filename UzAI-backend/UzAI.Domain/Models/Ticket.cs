using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("Tickets")]
public class Ticket
{
	public uint Id { get; set; }

	[MaxLength(32)]
	public string Number { get; set; } = null!;

	/// <summary>
	/// High-level category of the ticket (e.g. bug, feature).
	/// </summary>
	public TicketCategory Category { get; set; }

	public uint EmployeeId { get; set; }
	public Employee Employee { get; set; } = null!;

	public uint SprintId { get; set; }
	public Sprint Sprint { get; set; } = null!;

	public UsageRecord UsageRecord { get; set; } = null!;
}
