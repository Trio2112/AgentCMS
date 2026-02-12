namespace AgentCMS.Api.Middleware;

/// <summary>
/// Middleware for logging HTTP requests with correlation ID tracking
/// </summary>
public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Generate or extract correlation ID
        var correlationId = context.Request.Headers["X-Request-ID"].FirstOrDefault()
                            ?? Guid.NewGuid().ToString();

        // Add correlation ID to response headers
        context.Response.Headers["X-Request-ID"] = correlationId;

        // Log request
        _logger.LogInformation(
            "[{CorrelationId}] {Method} {Path} started",
            correlationId,
            context.Request.Method,
            context.Request.Path
        );

        var startTime = DateTime.UtcNow;

        try
        {
            await _next(context);

            // Log response
            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;
            _logger.LogInformation(
                "[{CorrelationId}] {Method} {Path} completed with {StatusCode} in {Duration}ms",
                correlationId,
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                duration
            );
        }
        catch (Exception ex)
        {
            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;
            _logger.LogError(
                ex,
                "[{CorrelationId}] {Method} {Path} failed after {Duration}ms",
                correlationId,
                context.Request.Method,
                context.Request.Path,
                duration
            );
            throw;
        }
    }
}
