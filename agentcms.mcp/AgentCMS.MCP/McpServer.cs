using System.Text.Json;
using System.Text.Json.Serialization;

namespace AgentCMS.MCP;

public class McpServer
{
    private readonly Dictionary<string, Func<JsonElement, Task<object>>> _tools;
    private bool _initialized = false;
    private readonly JsonSerializerOptions _jsonOptions;

    public McpServer()
    {
        _tools = new Dictionary<string, Func<JsonElement, Task<object>>>();
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
        
        RegisterTools();
    }

    private void RegisterTools()
    {
        // Register example tools
        _tools["echo"] = EchoTool;
        _tools["get_time"] = GetTimeTool;
    }

    public async Task RunAsync()
    {
        await Console.Error.WriteLineAsync("MCP Server starting...");
        
        using var reader = new StreamReader(Console.OpenStandardInput());
        using var writer = new StreamWriter(Console.OpenStandardOutput()) { AutoFlush = true };

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(line))
                continue;

            await Console.Error.WriteLineAsync($"Received: {line}");

            try
            {
                var request = JsonSerializer.Deserialize<JsonRpcRequest>(line, _jsonOptions);
                if (request == null)
                    continue;

                var response = await HandleRequestAsync(request);
                var responseJson = JsonSerializer.Serialize(response, _jsonOptions);
                
                await writer.WriteLineAsync(responseJson);
                await Console.Error.WriteLineAsync($"Sent: {responseJson}");
            }
            catch (Exception ex)
            {
                await Console.Error.WriteLineAsync($"Error processing request: {ex}");
                var errorResponse = new JsonRpcResponse
                {
                    JsonRpc = "2.0",
                    Id = null,
                    Error = new JsonRpcError
                    {
                        Code = -32603,
                        Message = "Internal error",
                        Data = ex.Message
                    }
                };
                var errorJson = JsonSerializer.Serialize(errorResponse, _jsonOptions);
                await writer.WriteLineAsync(errorJson);
            }
        }
    }

    private async Task<JsonRpcResponse> HandleRequestAsync(JsonRpcRequest request)
    {
        try
        {
            // Check if we need initialization for certain methods
            if (!_initialized && request.Method != "initialize" && request.Method != "ping")
            {
                throw new Exception("Server not initialized. Call 'initialize' first.");
            }

            object? result = request.Method switch
            {
                "initialize" => await HandleInitializeAsync(request.Params),
                "tools/list" => await HandleToolsListAsync(),
                "tools/call" => await HandleToolCallAsync(request.Params),
                "ping" => new { },
                _ => throw new Exception($"Unknown method: {request.Method}")
            };

            return new JsonRpcResponse
            {
                JsonRpc = "2.0",
                Id = request.Id,
                Result = result
            };
        }
        catch (Exception ex)
        {
            return new JsonRpcResponse
            {
                JsonRpc = "2.0",
                Id = request.Id,
                Error = new JsonRpcError
                {
                    Code = -32603,
                    Message = ex.Message,
                    Data = ex.StackTrace
                }
            };
        }
    }

    private Task<object> HandleInitializeAsync(JsonElement? parameters)
    {
        _initialized = true;
        var result = new
        {
            protocolVersion = "2024-11-05",
            capabilities = new
            {
                tools = new { }
            },
            serverInfo = new
            {
                name = "AgentCMS.MCP",
                version = "1.0.0"
            }
        };
        return Task.FromResult<object>(result);
    }

    private Task<object> HandleToolsListAsync()
    {
        var tools = new object[]
        {
            new
            {
                name = "echo",
                description = "Returns the input message back to the caller",
                inputSchema = new
                {
                    type = "object",
                    properties = new
                    {
                        message = new
                        {
                            type = "string",
                            description = "The message to echo back"
                        }
                    },
                    required = new[] { "message" }
                }
            },
            new
            {
                name = "get_time",
                description = "Returns the current server time",
                inputSchema = new
                {
                    type = "object",
                    properties = new { }
                }
            }
        };

        return Task.FromResult<object>(new { tools });
    }

    private async Task<object> HandleToolCallAsync(JsonElement? parameters)
    {
        if (!parameters.HasValue)
            throw new Exception("Missing parameters for tool call");

        var toolName = parameters.Value.GetProperty("name").GetString();
        var arguments = parameters.Value.TryGetProperty("arguments", out var args) 
            ? args 
            : default;

        if (string.IsNullOrEmpty(toolName) || !_tools.ContainsKey(toolName))
            throw new Exception($"Unknown tool: {toolName}");

        var toolResult = await _tools[toolName](arguments);
        
        return new
        {
            content = new[]
            {
                new
                {
                    type = "text",
                    text = JsonSerializer.Serialize(toolResult, _jsonOptions)
                }
            }
        };
    }

    // Tool implementations
    private Task<object> EchoTool(JsonElement arguments)
    {
        var message = arguments.GetProperty("message").GetString();
        return Task.FromResult<object>(new { echo = message });
    }

    private Task<object> GetTimeTool(JsonElement arguments)
    {
        var currentTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        return Task.FromResult<object>(new { time = currentTime, timezone = TimeZoneInfo.Local.DisplayName });
    }
}

// JSON-RPC Models
public class JsonRpcRequest
{
    [JsonPropertyName("jsonrpc")]
    public string JsonRpc { get; set; } = "2.0";
    
    [JsonPropertyName("id")]
    public object? Id { get; set; }
    
    [JsonPropertyName("method")]
    public string Method { get; set; } = "";
    
    [JsonPropertyName("params")]
    public JsonElement? Params { get; set; }
}

public class JsonRpcResponse
{
    [JsonPropertyName("jsonrpc")]
    public string JsonRpc { get; set; } = "2.0";
    
    [JsonPropertyName("id")]
    public object? Id { get; set; }
    
    [JsonPropertyName("result")]
    public object? Result { get; set; }
    
    [JsonPropertyName("error")]
    public JsonRpcError? Error { get; set; }
}

public class JsonRpcError
{
    [JsonPropertyName("code")]
    public int Code { get; set; }
    
    [JsonPropertyName("message")]
    public string Message { get; set; } = "";
    
    [JsonPropertyName("data")]
    public object? Data { get; set; }
}
