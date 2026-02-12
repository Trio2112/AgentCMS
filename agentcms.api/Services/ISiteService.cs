using AgentCMS.Api.Models.DTOs;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service interface for Site business logic
/// </summary>
public interface ISiteService
{
    Task<SiteDto?> GetByIdAsync(Guid id);
    Task<List<SiteDto>> ListAsync();
    Task<SiteDto> CreateAsync(CreateSiteDto dto);
    Task<SiteDto> UpdateAsync(Guid id, UpdateSiteDto dto);
    Task DeleteAsync(Guid id);
}
