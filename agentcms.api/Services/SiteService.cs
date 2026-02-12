using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Models.Entities;
using AgentCMS.Api.Repositories;
using AgentCMS.Api.Middleware;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service implementation for Site business logic
/// </summary>
public class SiteService : ISiteService
{
    private readonly ISiteRepository _repository;

    public SiteService(ISiteRepository repository)
    {
        _repository = repository;
    }

    public async Task<SiteDto?> GetByIdAsync(Guid id)
    {
        var site = await _repository.GetByIdAsync(id);
        return site != null ? MapToDto(site) : null;
    }

    public async Task<List<SiteDto>> ListAsync()
    {
        var sites = await _repository.ListAsync();
        return sites.Select(MapToDto).ToList();
    }

    public async Task<SiteDto> CreateAsync(CreateSiteDto dto)
    {
        var site = new Site
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description
        };

        await _repository.AddAsync(site);
        return MapToDto(site);
    }

    public async Task<SiteDto> UpdateAsync(Guid id, UpdateSiteDto dto)
    {
        var site = await _repository.GetByIdAsync(id);
        if (site == null)
        {
            throw new ValidationException($"Site with ID {id} not found");
        }

        site.Name = dto.Name;
        site.Description = dto.Description;

        await _repository.UpdateAsync(site);
        return MapToDto(site);
    }

    public async Task DeleteAsync(Guid id)
    {
        // Check for existing content (deletion guard)
        if (await _repository.HasPagesAsync(id) || await _repository.HasAssetsAsync(id))
        {
            throw new ValidationException("Cannot delete site with existing content. Delete all pages and assets first.");
        }

        await _repository.DeleteAsync(id);
    }

    private static SiteDto MapToDto(Site site)
    {
        return new SiteDto
        {
            Id = site.Id,
            Name = site.Name,
            Description = site.Description
        };
    }
}
