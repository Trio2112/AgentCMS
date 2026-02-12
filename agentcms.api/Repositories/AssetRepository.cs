using Microsoft.EntityFrameworkCore;
using AgentCMS.Api.Data;
using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository implementation for Asset entity with tenant isolation
/// </summary>
public class AssetRepository : IAssetRepository
{
    private readonly AgentCmsContext _context;

    public AssetRepository(AgentCmsContext context)
    {
        _context = context;
    }

    public async Task<Asset?> GetByIdAsync(Guid siteId, Guid id)
    {
        return await _context.Assets
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.SiteId == siteId && a.Id == id);
    }

    public async Task<List<Asset>> ListAsync(Guid siteId)
    {
        return await _context.Assets
            .AsNoTracking()
            .Where(a => a.SiteId == siteId)
            .OrderByDescending(a => a.CreatedDate)
            .ToListAsync();
    }

    public async Task<Asset> AddAsync(Asset asset)
    {
        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();
        return asset;
    }

    public async Task DeleteAsync(Guid siteId, Guid id)
    {
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.SiteId == siteId && a.Id == id);
        
        if (asset != null)
        {
            _context.Assets.Remove(asset);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid siteId, Guid id)
    {
        return await _context.Assets.AnyAsync(a => a.SiteId == siteId && a.Id == id);
    }
}
