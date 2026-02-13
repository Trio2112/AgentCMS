namespace AgentCMS.Api.Storage;

/// <summary>
/// Abstraction for file storage operations (local filesystem, Azure Blob, S3, etc.)
/// </summary>
public interface IFileStore
{
    /// <summary>
    /// Save a file from a stream
    /// </summary>
    /// <param name="stream">File content stream</param>
    /// <param name="filename">Original filename</param>
    /// <param name="mimeType">MIME type</param>
    /// <returns>Storage path/key and public URL</returns>
    Task<(string StoragePath, string Url)> SaveAsync(Stream stream, string filename, string mimeType);

    /// <summary>
    /// Retrieve a file as a stream
    /// </summary>
    /// <param name="storagePath">Storage path/key returned from SaveAsync</param>
    /// <returns>File stream and MIME type</returns>
    Task<(Stream Stream, string MimeType)> GetStreamAsync(string storagePath);

    /// <summary>
    /// Delete a file
    /// </summary>
    /// <param name="storagePath">Storage path/key returned from SaveAsync</param>
    Task DeleteAsync(string storagePath);

    /// <summary>
    /// Check if a file exists
    /// </summary>
    /// <param name="storagePath">Storage path/key returned from SaveAsync</param>
    Task<bool> ExistsAsync(string storagePath);
}
