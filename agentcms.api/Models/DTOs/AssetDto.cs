using System.ComponentModel.DataAnnotations;

namespace AgentCMS.Api.Models.DTOs;

/// <summary>
/// DTO for Asset responses
/// </summary>
public class AssetDto
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Filename { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
    public string? CreatedBy { get; set; }
}

/// <summary>
/// DTO for creating an Asset from uploaded file
/// </summary>
public class CreateAssetDto
{
    [Required]
    public IFormFile File { get; set; } = null!;

    [MaxLength(255)]
    public string? CreatedBy { get; set; }
}

/// <summary>
/// DTO for creating an Asset from URL
/// </summary>
public class CreateAssetFromUrlDto
{
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? CreatedBy { get; set; }
}
