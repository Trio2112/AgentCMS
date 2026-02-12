using System.ComponentModel.DataAnnotations;

namespace AgentCMS.Api.Models.DTOs;

/// <summary>
/// DTO for Page responses
/// </summary>
public class PageDto
{
    public Guid Id { get; set; }
    public Guid SiteId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
    public DateTime? PublishedDate { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsPublished => PublishedDate.HasValue;
}

/// <summary>
/// DTO for creating a new Page
/// </summary>
public class CreatePageDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Body { get; set; }

    public bool IsPublished { get; set; }

    [MaxLength(255)]
    public string? CreatedBy { get; set; }
}

/// <summary>
/// DTO for updating an existing Page
/// </summary>
public class UpdatePageDto
{
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public string? Body { get; set; }

    public bool IsPublished { get; set; }

    [MaxLength(255)]
    public string? UpdatedBy { get; set; }
}
