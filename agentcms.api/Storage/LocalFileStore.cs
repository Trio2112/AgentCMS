namespace AgentCMS.Api.Storage;

/// <summary>
/// Local filesystem implementation of IFileStore
/// Stores files with GUID filenames to prevent path traversal attacks
/// </summary>
public class LocalFileStore : IFileStore
{
    private readonly string _basePath;
    private readonly string _baseUrl;

    public LocalFileStore(string basePath, string baseUrl)
    {
        _basePath = basePath ?? throw new ArgumentNullException(nameof(basePath));
        _baseUrl = baseUrl ?? throw new ArgumentNullException(nameof(baseUrl));

        // Ensure base directory exists
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<(string StoragePath, string Url)> SaveAsync(Stream stream, string filename, string mimeType)
    {
        // Generate GUID filename to prevent path traversal
        var extension = Path.GetExtension(filename);
        var storagePath = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(_basePath, storagePath);

        // Save file to disk
        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await stream.CopyToAsync(fileStream);

        // Generate public URL
        var url = $"{_baseUrl}/v1/assets/download/{storagePath}";

        return (storagePath, url);
    }

    public Task<(Stream Stream, string MimeType)> GetStreamAsync(string storagePath)
    {
        var fullPath = Path.Combine(_basePath, storagePath);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File not found: {storagePath}");
        }

        // Detect MIME type from extension
        var mimeType = GetMimeTypeFromExtension(Path.GetExtension(storagePath));
        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);

        return Task.FromResult((Stream: (Stream)stream, MimeType: mimeType));
    }

    public Task DeleteAsync(string storagePath)
    {
        var fullPath = Path.Combine(_basePath, storagePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string storagePath)
    {
        var fullPath = Path.Combine(_basePath, storagePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    private static string GetMimeTypeFromExtension(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream"
        };
    }
}
