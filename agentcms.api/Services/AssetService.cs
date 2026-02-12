using AgentCMS.Api.Models.DTOs;
using AgentCMS.Api.Models.Entities;
using AgentCMS.Api.Repositories;
using AgentCMS.Api.Storage;
using AgentCMS.Api.Middleware;

namespace AgentCMS.Api.Services;

/// <summary>
/// Service implementation for Asset business logic with file validation
/// </summary>
public class AssetService : IAssetService
{
    private readonly IAssetRepository _repository;
    private readonly ISiteRepository _siteRepository;
    private readonly IFileStore _fileStore;
    
    private static readonly HashSet<string> AllowedMimeTypes = new()
    {
        "image/jpeg",
        "image/png",
        "application/pdf"
    };

    private const long MaxFileSize = 30 * 1024 * 1024; // 30 MB

    public AssetService(IAssetRepository repository, ISiteRepository siteRepository, IFileStore fileStore)
    {
        _repository = repository;
        _siteRepository = siteRepository;
        _fileStore = fileStore;
    }

    public async Task<AssetDto?> GetByIdAsync(Guid siteId, Guid id)
    {
        var asset = await _repository.GetByIdAsync(siteId, id);
        return asset != null ? MapToDto(asset) : null;
    }

    public async Task<List<AssetDto>> ListAsync(Guid siteId)
    {
        var assets = await _repository.ListAsync(siteId);
        return assets.Select(MapToDto).ToList();
    }

    public async Task<AssetDto> UploadAsync(Guid siteId, CreateAssetDto dto)
    {
        // Validate SiteId exists
        if (!await _siteRepository.ExistsAsync(siteId))
        {
            throw new ValidationException($"Site with ID {siteId} not found");
        }

        // Validate file size
        if (dto.File.Length == 0)
        {
            throw new ValidationException("File cannot be empty");
        }

        if (dto.File.Length > MaxFileSize)
        {
            throw new ValidationException($"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)} MB");
        }

        // Validate MIME type
        var mimeType = dto.File.ContentType.ToLowerInvariant();
        if (!AllowedMimeTypes.Contains(mimeType))
        {
            throw new ValidationException($"File type '{mimeType}' is not allowed. Allowed types: {string.Join(", ", AllowedMimeTypes)}");
        }

        // Save file to storage
        using var stream = dto.File.OpenReadStream();
        var (storagePath, url) = await _fileStore.SaveAsync(stream, dto.File.FileName, mimeType);

        // Create asset entity
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            SiteId = siteId,
            Filename = dto.File.FileName,
            MimeType = mimeType,
            Url = url,
            CreatedDate = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy
        };

        await _repository.AddAsync(asset);
        return MapToDto(asset);
    }

    public async Task<AssetDto> CreateFromUrlAsync(Guid siteId, CreateAssetFromUrlDto dto)
    {
        // Validate SiteId exists
        if (!await _siteRepository.ExistsAsync(siteId))
        {
            throw new ValidationException($"Site with ID {siteId} not found");
        }

        // Download file from URL
        using var httpClient = new HttpClient();
        httpClient.Timeout = TimeSpan.FromSeconds(30);

        HttpResponseMessage response;
        try
        {
            response = await httpClient.GetAsync(dto.Url);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            throw new ValidationException($"Failed to download file from URL: {ex.Message}");
        }

        // Validate file size
        var contentLength = response.Content.Headers.ContentLength ?? 0;
        if (contentLength == 0)
        {
            throw new ValidationException("Downloaded file is empty");
        }

        if (contentLength > MaxFileSize)
        {
            throw new ValidationException($"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)} MB");
        }

        // Validate MIME type
        var mimeType = (response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream").ToLowerInvariant();
        if (!AllowedMimeTypes.Contains(mimeType))
        {
            throw new ValidationException($"File type '{mimeType}' is not allowed. Allowed types: {string.Join(", ", AllowedMimeTypes)}");
        }

        // Extract filename from URL
        var filename = Path.GetFileName(new Uri(dto.Url).LocalPath);
        if (string.IsNullOrEmpty(filename))
        {
            filename = "download" + GetExtensionFromMimeType(mimeType);
        }

        // Save file to storage
        using var stream = await response.Content.ReadAsStreamAsync();
        var (storagePath, url) = await _fileStore.SaveAsync(stream, filename, mimeType);

        // Create asset entity
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            SiteId = siteId,
            Filename = filename,
            MimeType = mimeType,
            Url = url,
            CreatedDate = DateTime.UtcNow,
            CreatedBy = dto.CreatedBy
        };

        await _repository.AddAsync(asset);
        return MapToDto(asset);
    }

    public async Task DeleteAsync(Guid siteId, Guid id)
    {
        var asset = await _repository.GetByIdAsync(siteId, id);
        if (asset != null)
        {
            // Delete file from storage
            var storagePath = ExtractStoragePathFromUrl(asset.Url);
            await _fileStore.DeleteAsync(storagePath);

            // Delete asset entity
            await _repository.DeleteAsync(siteId, id);
        }
    }

    public async Task<(Stream Stream, string MimeType, string Filename)> DownloadAsync(Guid siteId, Guid id)
    {
        var asset = await _repository.GetByIdAsync(siteId, id);
        if (asset == null)
        {
            throw new ValidationException($"Asset with ID {id} not found in site {siteId}");
        }

        var storagePath = ExtractStoragePathFromUrl(asset.Url);
        var (stream, mimeType) = await _fileStore.GetStreamAsync(storagePath);

        return (stream, mimeType, asset.Filename);
    }

    private static AssetDto MapToDto(Asset asset)
    {
        return new AssetDto
        {
            Id = asset.Id,
            SiteId = asset.SiteId,
            Filename = asset.Filename,
            MimeType = asset.MimeType,
            Url = asset.Url,
            CreatedDate = asset.CreatedDate,
            CreatedBy = asset.CreatedBy
        };
    }

    private static string ExtractStoragePathFromUrl(string url)
    {
        // Extract filename from URL: https://localhost:5001/v1/assets/download/{filename}
        var lastSlash = url.LastIndexOf('/');
        return lastSlash >= 0 ? url.Substring(lastSlash + 1) : url;
    }

    private static string GetExtensionFromMimeType(string mimeType)
    {
        return mimeType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "application/pdf" => ".pdf",
            _ => ""
        };
    }
}
