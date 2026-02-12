using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository interface for Page entity operations with site-scoped isolation
/// </summary>
public interface IPageRepository
{
    Task<Page?> GetByIdAsync(Guid siteId, Guid id);
    Task<List<Page>> ListAsync(Guid siteId);
    Task<List<Page>> ListPublishedAsync(Guid siteId);
    Task<Page> AddAsync(Page page);
    Task<Page> UpdateAsync(Page page);
    Task DeleteAsync(Guid siteId, Guid id);
    Task<bool> ExistsAsync(Guid siteId, Guid id);
}
