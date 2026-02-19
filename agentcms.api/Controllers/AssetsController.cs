using Microsoft.AspNetCore.Mvc;
using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Services;

namespace AgentCMS.Api.Controllers;

/// <summary>
/// API controller for Asset upload and download (User Story 3)
/// </summary>
[ApiController]
[Route("v1/sites/{siteId}/assets")]
[Produces("application/json")]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _service;
    private readonly ILogger<AssetsController> _logger;

    public AssetsController(IAssetService service, ILogger<AssetsController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// List all assets for a site
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AssetDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> ListAssets(Guid siteId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        var assets = await _service.ListAsync(siteId);
        return Ok(assets);
    }

    /// <summary>
    /// Get an asset by ID
    /// </summary>
    [HttpGet("{assetId}")]
    [ProducesResponseType(typeof(AssetDto), 200)]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> GetAsset(Guid siteId, Guid assetId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        var asset = await _service.GetByIdAsync(siteId, assetId);
        if (asset == null)
        {
            return NoContent(); // Non-standard: using 204 instead of 404
        }
        return Ok(asset);
    }

    /// <summary>
    /// Upload a new asset (multipart/form-data)
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(AssetDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> UploadAsset(Guid siteId, [FromForm] CreateAssetDto dto)
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

        var asset = await _service.UploadAsync(siteId, dto);
        return CreatedAtAction(nameof(GetAsset), new { siteId = asset.SiteId, assetId = asset.Id }, asset);
    }

    /// <summary>
    /// Create an asset from a URL
    /// </summary>
    [HttpPost("url")]
    [ProducesResponseType(typeof(AssetDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> CreateAssetFromUrl(Guid siteId, [FromBody] CreateAssetFromUrlDto dto)
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

        var asset = await _service.CreateFromUrlAsync(siteId, dto);
        return CreatedAtAction(nameof(GetAsset), new { siteId = asset.SiteId, assetId = asset.Id }, asset);
    }

    /// <summary>
    /// Download an asset file
    /// </summary>
    [HttpGet("{assetId}/file")]
    [ProducesResponseType(200)]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DownloadAsset(Guid siteId, Guid assetId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        var (stream, mimeType, filename) = await _service.DownloadAsync(siteId, assetId);
        return File(stream, mimeType, filename);
    }

    /// <summary>
    /// Delete an asset
    /// </summary>
    [HttpDelete("{assetId}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    [ProducesResponseType(500)]
    public async Task<IActionResult> DeleteAsset(Guid siteId, Guid assetId)
    {
        // Validate siteId parameter
        if (siteId == Guid.Empty)
        {
            return BadRequest(new { error = "Invalid siteId parameter" });
        }

        await _service.DeleteAsync(siteId, assetId);
        return NoContent();
    }
}
