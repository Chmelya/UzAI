using Microsoft.AspNetCore.Mvc;
using UzAI.Application.Models;
using UzAI.Application.Services;

namespace UzAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsageController : ControllerBase
{
	private readonly IUsageService _usageService;

	public UsageController(IUsageService usageService)
	{
		_usageService = usageService;
	}

	/// <summary>
	/// Returns usage records and computed metrics.
	/// </summary>
	[HttpGet]
	[ProducesResponseType(typeof(UsageResponseDto), StatusCodes.Status200OK)]
	public async Task<ActionResult<UsageResponseDto>> GetUsageWithMetrics(CancellationToken cancellationToken)
	{
		var result = await _usageService.GetUsageWithMetricsAsync(cancellationToken);
		return Ok(result);
	}
}
