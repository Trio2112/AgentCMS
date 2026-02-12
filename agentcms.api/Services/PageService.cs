using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Models.Entities;
using AgentCMS.Api.Repositories;
using AgentCMS.Api.Middleware;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service implementation for Page business logic with lifecycle management
/// </summary>
public class PageService : IPageService
{
    private readonly IPageRepository _repository;
    private readonly ISiteRepository _siteRepository;

    public PageService(IPageRepository repository, ISiteRepository siteRepository)
    {
        _repository = repository;
        _siteRepository = siteRepository;
    }

    public async Task<PageDto?> GetByIdAsync(Guid siteId, Guid id)
    {
        var page = await _repository.GetByIdAsync(siteId, id);
        return page != null ? MapToDto(page) : null;
    }

    public async Task<List<PageDto>> ListAsync(Guid siteId)
    {
        var pages = await _repository.ListAsync(siteId);
        return pages.Select(MapToDto).ToList();
    }

    public async Task<List<PageDto>> ListPublishedAsync(Guid siteId)
    {
        var pages = await _repository.ListPublishedAsync(siteId);
        return pages.Select(MapToDto).ToList();
    }

    public async Task<PageDto> CreateAsync(Guid siteId, CreatePageDto dto)
    {
        // Validate SiteId exists
        if (!await _siteRepository.ExistsAsync(siteId))
        {
            throw new ValidationException($"Site with ID {siteId} not found");
        }

        var now = DateTime.UtcNow;
        var page = new Page
        {
            Id = Guid.NewGuid(),
            SiteId = siteId,
            Title = dto.Title,
            Body = dto.Body,
            CreatedDate = now,
            UpdatedDate = now,
            PublishedDate = dto.IsPublished ? now : null,
            CreatedBy = dto.CreatedBy,
            UpdatedBy = dto.CreatedBy
        };

        await _repository.AddAsync(page);
        return MapToDto(page);
    }

    public async Task<PageDto> UpdateAsync(Guid siteId, Guid id, UpdatePageDto dto)
    {
        var page = await _repository.GetByIdAsync(siteId, id);
        if (page == null)
        {
            throw new ValidationException($"Page with ID {id} not found in site {siteId}");
        }

        var now = DateTime.UtcNow;
        page.Title = dto.Title;
        page.Body = dto.Body;
        page.UpdatedDate = now;
        page.UpdatedBy = dto.UpdatedBy;

        // Handle publish state transition
        if (dto.IsPublished && page.PublishedDate == null)
        {
            // Publishing: set PublishedDate
            page.PublishedDate = now;
        }
        else if (!dto.IsPublished && page.PublishedDate != null)
        {
            // Unpublishing: clear PublishedDate
            page.PublishedDate = null;
        }

        await _repository.UpdateAsync(page);
        return MapToDto(page);
    }

    public async Task DeleteAsync(Guid siteId, Guid id)
    {
        await _repository.DeleteAsync(siteId, id);
    }

    private static PageDto MapToDto(Page page)
    {
        return new PageDto
        {
            Id = page.Id,
            SiteId = page.SiteId,
            Title = page.Title,
            Body = page.Body,
            CreatedDate = page.CreatedDate,
            UpdatedDate = page.UpdatedDate,
            PublishedDate = page.PublishedDate,
            CreatedBy = page.CreatedBy,
            UpdatedBy = page.UpdatedBy
        };
    }
}
