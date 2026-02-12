using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository interface for Site entity operations
/// </summary>
public interface ISiteRepository
{
    Task<Site?> GetByIdAsync(Guid id);
    Task<List<Site>> ListAsync();
    Task<Site> AddAsync(Site site);
    Task<Site> UpdateAsync(Site site);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<bool> HasPagesAsync(Guid id);
    Task<bool> HasAssetsAsync(Guid id);
}
