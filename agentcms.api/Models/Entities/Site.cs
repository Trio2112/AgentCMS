namespace AgentCMS.Api.Models.Entities;

/// <summary>
/// Top-level tenant container for all CMS content.
/// Provides logical isolation boundary for pages and assets.
/// </summary>
public class Site
{
    /// <summary>
    /// Unique identifier (server-generated)
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Human-readable site name (required, unique, max 255 characters)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional site description (max 255 characters)
    /// </summary>
    public string? Description { get; set; }

    // Navigation properties
    public ICollection<Page> Pages { get; set; } = new List<Page>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
}
