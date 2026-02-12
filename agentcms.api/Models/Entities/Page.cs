namespace AgentCMS.Api.Models.Entities;

/// <summary>
/// Content page with fixed schema and lifecycle states (draft/published)
/// </summary>
public class Page
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
    /// Page title (required, max 255 characters)
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Page body content (unlimited text)
    /// </summary>
    public string? Body { get; set; }

    /// <summary>
    /// Creation timestamp (UTC, server-controlled)
    /// </summary>
    public DateTime CreatedDate { get; set; }

    /// <summary>
    /// Last update timestamp (UTC, server-controlled)
    /// </summary>
    public DateTime UpdatedDate { get; set; }

    /// <summary>
    /// Publication timestamp (UTC, nullable).
    /// Null = draft state, Non-null = published state
    /// </summary>
    public DateTime? PublishedDate { get; set; }

    /// <summary>
    /// User identifier who created this page (max 255 characters)
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// User identifier who last updated this page (max 255 characters)
    /// </summary>
    public string? UpdatedBy { get; set; }

    // Navigation property
    public Site Site { get; set; } = null!;
}
