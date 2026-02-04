using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("Sprints")]
public class Sprint
{
	public uint Id { get; set; }

	public string Name { get; set; } = null!;

	public DateTime StartDate { get; set; }

	public DateTime EndDate { get; set; }

	public ICollection<Ticket> Tickets { get; set; } = null!;
}
