using AgentCMS.Api.Models.DTOs;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service interface for Asset business logic with file validation
/// </summary>
public interface IAssetService
{
    Task<AssetDto?> GetByIdAsync(Guid siteId, Guid id);
    Task<List<AssetDto>> ListAsync(Guid siteId);
    Task<AssetDto> UploadAsync(Guid siteId, CreateAssetDto dto);
    Task<AssetDto> CreateFromUrlAsync(Guid siteId, CreateAssetFromUrlDto dto);
    Task DeleteAsync(Guid siteId, Guid id);
    Task<(Stream Stream, string MimeType, string Filename)> DownloadAsync(Guid siteId, Guid id);
}
