using Microsoft.AspNetCore.Mvc;
using UzAI.Application.Services;
using UzAI.Domain.Models;

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
    /// Returns all usage records (proxy calculations applied by the service).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UsageRecord>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UsageRecord>>> GetAll(CancellationToken cancellationToken)
    {
        var records = await _usageService.GetAllAsync(cancellationToken);

        return Ok(records);
    }
}
