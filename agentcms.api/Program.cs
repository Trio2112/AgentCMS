using Microsoft.EntityFrameworkCore;
using AgentCMS.Api.Data;
using AgentCMS.Api.Storage;
using AgentCMS.Api.Middleware;
using AgentCMS.Api.Repositories;
using AgentCMS.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework Core with SQL Server
builder.Services.AddDbContext<AgentCmsContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories
builder.Services.AddScoped<ISiteRepository, SiteRepository>();
builder.Services.AddScoped<IPageRepository, PageRepository>();
builder.Services.AddScoped<IAssetRepository, AssetRepository>();

// Register services
builder.Services.AddScoped<ISiteService, SiteService>();
builder.Services.AddScoped<IPageService, PageService>();
builder.Services.AddScoped<IAssetService, AssetService>();

// Register file storage
builder.Services.AddScoped<IFileStore>(provider =>
{
    var config = builder.Configuration.GetSection("FileStorage");
    var localPath = config["LocalPath"] ?? "C:\\AgentCMS\\uploads";
    var baseUrl = config["BaseUrl"] ?? "https://localhost:5001";
    return new LocalFileStore(localPath, baseUrl);
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "AgentCMS API",
        Version = "v1",
        Description = "RESTful headless CMS API for managing multi-tenant content (Sites, Pages, Assets) with site-scoped isolation"
    });
});

// Configure CORS for local development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "AgentCMS API v1");
        options.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

// Custom middleware
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlerMiddleware>();

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
