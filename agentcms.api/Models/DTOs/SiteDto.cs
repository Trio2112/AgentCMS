using System.ComponentModel.DataAnnotations;

namespace AgentCMS.Api.Models.DTOs;

/// <summary>
/// DTO for Site responses
/// </summary>
public class SiteDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// DTO for creating a new Site
/// </summary>
public class CreateSiteDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }
}

/// <summary>
/// DTO for updating an existing Site
/// </summary>
public class UpdateSiteDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }
}
