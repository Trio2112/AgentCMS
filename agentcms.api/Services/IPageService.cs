using AgentCMS.Api.Models.DTOs;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service interface for Page business logic with lifecycle management
/// </summary>
public interface IPageService
{
    Task<PageDto?> GetByIdAsync(Guid siteId, Guid id);
    Task<List<PageDto>> ListAsync(Guid siteId);
    Task<List<PageDto>> ListPublishedAsync(Guid siteId);
    Task<PageDto> CreateAsync(Guid siteId, CreatePageDto dto);
    Task<PageDto> UpdateAsync(Guid siteId, Guid id, UpdatePageDto dto);
    Task DeleteAsync(Guid siteId, Guid id);
}
