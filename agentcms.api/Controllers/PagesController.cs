using Microsoft.AspNetCore.Mvc;
using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Services;

namespace AgentCMS.Api.Controllers;

/// <summary>
/// API controller for Page management with lifecycle states (User Story 2)
/// </summary>
[ApiController]
[Route("v1/sites/{siteId}/pages")]
[Produces("application/json")]
public class PagesController : ControllerBase
{
    private readonly IPageService _service;
    private readonly ILogger<PagesController> _logger;

    public PagesController(IPageService service, ILogger<PagesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// List all pages for a site
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PageDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> ListPages(Guid siteId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        var pages = await _service.ListAsync(siteId);
        return Ok(pages);
    }

    /// <summary>
    /// Get a page by ID
    /// </summary>
    [HttpGet("{pageId}")]
    [ProducesResponseType(typeof(PageDto), 200)]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetPage(Guid siteId, Guid pageId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        var page = await _service.GetByIdAsync(siteId, pageId);
        if (page == null)
        {
            return NoContent(); // Non-standard: using 204 instead of 404
        }
        return Ok(page);
    }

    /// <summary>
    /// Create a new page
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PageDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> CreatePage(Guid siteId, [FromBody] CreatePageDto dto)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var page = await _service.CreateAsync(siteId, dto);
        return CreatedAtAction(nameof(GetPage), new { siteId = page.SiteId, pageId = page.Id }, page);
    }

    /// <summary>
    /// Update an existing page
    /// </summary>
    [HttpPut("{pageId}")]
    [ProducesResponseType(typeof(PageDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> UpdatePage(Guid siteId, Guid pageId, [FromBody] UpdatePageDto dto)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var page = await _service.UpdateAsync(siteId, pageId, dto);
        return Ok(page);
    }

    /// <summary>
    /// Delete a page
    /// </summary>
    [HttpDelete("{pageId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DeletePage(Guid siteId, Guid pageId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        await _service.DeleteAsync(siteId, pageId);
        return NoContent();
    }
}
