namespace AgentCMS.Api.Models.Entities;

/// <summary>
/// File asset (image, PDF, etc.) with MIME validation and storage abstraction
/// </summary>
public class Asset
{
    /// <summary>
    /// Unique identifier (server-generated)
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to parent Site (required)
    /// </summary>
    public Guid SiteId { get; set; }

    /// <summary>
    /// Original filename (max 255 characters)
    /// </summary>
    public string Filename { get; set; } = string.Empty;

    /// <summary>
    /// MIME type (max 100 characters).
    /// Validated against whitelist: image/jpeg, image/png, application/pdf
    /// </summary>
    public string MimeType { get; set; } = string.Empty;

    /// <summary>
    /// Public URL to access the asset (max 500 characters)
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Creation timestamp (UTC, server-controlled)
    /// </summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>
    /// User identifier who created this asset (max 255 characters)
    /// </summary>
    public string? CreatedBy { get; set; }

    // Navigation property
    public Site Site { get; set; } = null!;
}
