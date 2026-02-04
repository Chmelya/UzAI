using System.ComponentModel.DataAnnotations.Schema;

namespace UzAI.Domain.Models;

[Table("Employees")]
public class Employee
{
	public uint Id { get; set; }

	public string Name { get; set; } = null!;

	public string Surname { get; set; } = null!;

	public ICollection<Ticket> AssignedTickets { get; set; } = null!;
}
