using Microsoft.AspNetCore.Mvc;
using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Services;

namespace AgentCMS.Api.Controllers;

/// <summary>
/// API controller for Site management (User Story 1)
/// </summary>
[ApiController]
[Route("v1/sites")]
[Produces("application/json")]
public class SitesController : ControllerBase
{
    private readonly ISiteService _service;
    private readonly ILogger<SitesController> _logger;

    public SitesController(ISiteService service, ILogger<SitesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// List all sites
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SiteDto>), 200)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> ListSites()
    {
        var sites = await _service.ListAsync();
        return Ok(sites);
    }

    /// <summary>
    /// Get a site by ID
    /// </summary>
    [HttpGet("{siteId}")]
    [ProducesResponseType(typeof(SiteDto), 200)]
    [ProducesResponseType(204)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetSite(Guid siteId)
    {
        var site = await _service.GetByIdAsync(siteId);
        if (site == null)
        {
            return NoContent(); // Non-standard: using 204 instead of 404
        }
        return Ok(site);
    }

    /// <summary>
    /// Create a new site
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SiteDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> CreateSite([FromBody] CreateSiteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var site = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetSite), new { siteId = site.Id }, site);
    }

    /// <summary>
    /// Update an existing site
    /// </summary>
    [HttpPut("{siteId}")]
    [ProducesResponseType(typeof(SiteDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> UpdateSite(Guid siteId, [FromBody] UpdateSiteDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var site = await _service.UpdateAsync(siteId, dto);
        return Ok(site);
    }

    /// <summary>
    /// Delete a site
    /// </summary>
    /// <remarks>
    /// Cannot delete a site with existing pages or assets (deletion guard).
    /// Returns 400 Bad Request if site has content.
    /// </remarks>
    [HttpDelete("{siteId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DeleteSite(Guid siteId)
    {
        await _service.DeleteAsync(siteId);
        return NoContent();
    }
}
