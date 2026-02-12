using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository interface for Asset entity operations with site-scoped isolation
/// </summary>
public interface IAssetRepository
{
    Task<Asset?> GetByIdAsync(Guid siteId, Guid id);
    Task<List<Asset>> ListAsync(Guid siteId);
    Task<Asset> AddAsync(Asset asset);
    Task DeleteAsync(Guid siteId, Guid id);
    Task<bool> ExistsAsync(Guid siteId, Guid id);
}
