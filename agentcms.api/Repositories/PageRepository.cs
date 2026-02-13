using Microsoft.EntityFrameworkCore;
using AgentCMS.Api.Data;
using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Repositories;

/// <summary>
/// Repository implementation for Page entity with tenant isolation
/// </summary>
public class PageRepository : IPageRepository
{
    private readonly AgentCmsContext _context;

    public PageRepository(AgentCmsContext context)
    {
        _context = context;
    }

    public async Task<Page?> GetByIdAsync(Guid siteId, Guid id)
    {
        return await _context.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.SiteId == siteId && p.Id == id);
    }

    public async Task<List<Page>> ListAsync(Guid siteId)
    {
        return await _context.Pages
            .AsNoTracking()
            .Where(p => p.SiteId == siteId)
            .OrderByDescending(p => p.UpdatedDate)
            .ToListAsync();
    }

    public async Task<List<Page>> ListPublishedAsync(Guid siteId)
    {
        return await _context.Pages
            .AsNoTracking()
            .Where(p => p.SiteId == siteId && p.PublishedDate != null)
            .OrderByDescending(p => p.PublishedDate)
            .ToListAsync();
    }

    public async Task<Page> AddAsync(Page page)
    {
        _context.Pages.Add(page);
        await _context.SaveChangesAsync();
        return page;
    }

    public async Task<Page> UpdateAsync(Page page)
    {
        _context.Pages.Update(page);
        await _context.SaveChangesAsync();
        return page;
    }

    public async Task DeleteAsync(Guid siteId, Guid id)
    {
        var page = await _context.Pages
            .FirstOrDefaultAsync(p => p.SiteId == siteId && p.Id == id);
        
        if (page != null)
        {
            _context.Pages.Remove(page);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid siteId, Guid id)
    {
        return await _context.Pages.AnyAsync(p => p.SiteId == siteId && p.Id == id);
    }
}
