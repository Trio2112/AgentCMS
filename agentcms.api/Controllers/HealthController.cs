using Microsoft.AspNetCore.Mvc;

namespace AgentCMS.Api.Controllers;

/// <summary>
/// Health check endpoint for monitoring
/// </summary>
[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Basic health check
    /// </summary>
    [HttpGet]
    [ProducesResponseType(200)]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "AgentCMS API"
        });
    }
}
