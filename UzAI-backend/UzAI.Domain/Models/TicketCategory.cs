namespace UzAI.Domain.Models;

/// <summary>
/// High-level ticket category used for reporting and analysis.
/// </summary>
public enum TicketCategory : byte
{
	CodeReview = 1,
	Bug = 2,
	Feature = 3,
	Test = 4,
	Other = 5,
}

