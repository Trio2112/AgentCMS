using Microsoft.EntityFrameworkCore;
using AgentCMS.Api.Data;
using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository implementation for Site entity
/// </summary>
public class SiteRepository : ISiteRepository
{
    private readonly AgentCmsContext _context;

    public SiteRepository(AgentCmsContext context)
    {
        _context = context;
    }

    public async Task<Site?> GetByIdAsync(Guid id)
    {
        return await _context.Sites
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<List<Site>> ListAsync()
    {
        return await _context.Sites
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .ToListAsync();
    }

    public async Task<Site> AddAsync(Site site)
    {
        _context.Sites.Add(site);
        await _context.SaveChangesAsync();
        return site;
    }

    public async Task<Site> UpdateAsync(Site site)
    {
        _context.Sites.Update(site);
        await _context.SaveChangesAsync();
        return site;
    }

    public async Task DeleteAsync(Guid id)
    {
        var site = await _context.Sites.FindAsync(id);
        if (site != null)
        {
            _context.Sites.Remove(site);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Sites.AnyAsync(s => s.Id == id);
    }

    public async Task<bool> HasPagesAsync(Guid id)
    {
        return await _context.Pages.AnyAsync(p => p.SiteId == id);
    }

    public async Task<bool> HasAssetsAsync(Guid id)
    {
        return await _context.Assets.AnyAsync(a => a.SiteId == id);
    }
}
