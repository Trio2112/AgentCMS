# AgentCMS MCP Server

A .NET 8 console application that implements the Model Context Protocol (MCP) server specification.

## Overview

This MCP server provides a JSON-RPC 2.0 interface over stdio for communication with MCP clients. It includes example tools and can be extended with custom functionality.

## Features

- Full MCP protocol support (2024-11-05)
- JSON-RPC 2.0 over stdio
- Example tools:
  - `echo`: Returns the input message back
  - `get_time`: Returns current server time

## Building

```bash
dotnet build
```

## Running

```bash
dotnet run
```

The server communicates via stdio, so it's designed to be invoked by an MCP client.

## Configuration for MCP Clients

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentcms": {
      "command": "dotnet",
      "args": [
        "run",
        "--project",
        "C:\\data\\git\\AgentCMS\\agentcms.mcp\\AgentCMS.MCP\\AgentCMS.MCP.csproj"
      ]
    }
  }
}
```

### Other MCP Clients

Use the following command to start the server:

```bash
dotnet run --project AgentCMS.MCP.csproj
```

## Protocol Support

This server implements the MCP protocol with the following methods:

- `initialize`: Initialize the server and exchange capabilities
- `tools/list`: List available tools
- `tools/call`: Execute a tool with arguments
- `ping`: Health check

## Adding Custom Tools

To add new tools, modify the `RegisterTools()` method in `McpServer.cs`:

```csharp
private void RegisterTools()
{
    _tools["my_tool"] = MyCustomTool;
}

private Task<object> MyCustomTool(JsonElement arguments)
{
    // Implement your tool logic here
    return Task.FromResult<object>(new { result = "success" });
}
```

Also update `HandleToolsListAsync()` to include your tool's schema:

```csharp
new
{
    name = "my_tool",
    description = "Description of what the tool does",
    inputSchema = new
    {
        type = "object",
        properties = new
        {
            param1 = new
            {
                type = "string",
                description = "Description of param1"
            }
        },
        required = new[] { "param1" }
    }
}
```

## Development

### Requirements

- .NET 8.0 SDK or later
- Visual Studio Code or Visual Studio 2022 (optional)

### Project Structure

```
AgentCMS.MCP/
├── Program.cs           # Entry point
├── McpServer.cs         # Main MCP server implementation
├── AgentCMS.MCP.csproj  # Project file
└── README.md            # This file
```

## Testing

You can test the server using stdio by sending JSON-RPC requests:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
```

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"echo","arguments":{"message":"Hello, World!"}}}
```

## License

MIT
