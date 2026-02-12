using Microsoft.EntityFrameworkCore;
using AgentCMS.Api.Models.Entities;

namespace AgentCMS.Api.Data;

/// <summary>
/// Entity Framework Core database context for AgentCMS
/// </summary>
public class AgentCmsContext : DbContext
{
    public AgentCmsContext(DbContextOptions<AgentCmsContext> options)
        : base(options)
    {
    }

    public DbSet<Site> Sites { get; set; } = null!;
    public DbSet<Page> Pages { get; set; } = null!;
    public DbSet<Asset> Assets { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Site entity
        modelBuilder.Entity<Site>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.Description)
                .HasMaxLength(255);
            
            // Unique constraint on Name
            entity.HasIndex(e => e.Name)
                .IsUnique();

            // One-to-many relationships
            entity.HasMany(e => e.Pages)
                .WithOne(e => e.Site)
                .HasForeignKey(e => e.SiteId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Assets)
                .WithOne(e => e.Site)
                .HasForeignKey(e => e.SiteId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Page entity
        modelBuilder.Entity<Page>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.SiteId)
                .IsRequired();
            
            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.Body)
                .HasColumnType("varchar(max)");
            
            entity.Property(e => e.CreatedDate)
                .IsRequired();
            
            entity.Property(e => e.UpdatedDate)
                .IsRequired();
            
            entity.Property(e => e.PublishedDate);
            
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255);
            
            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(255);

            // Index on SiteId for tenant isolation queries
            entity.HasIndex(e => e.SiteId);

            // Composite index on (SiteId, PublishedDate) for published page queries
            entity.HasIndex(e => new { e.SiteId, e.PublishedDate });
        });

        // Configure Asset entity
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.SiteId)
                .IsRequired();
            
            entity.Property(e => e.Filename)
                .IsRequired()
                .HasMaxLength(255);
            
            entity.Property(e => e.MimeType)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.Url)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.CreatedDate)
                .IsRequired();
            
            entity.Property(e => e.CreatedBy)
                .HasMaxLength(255);

            // Index on SiteId for tenant isolation queries
            entity.HasIndex(e => e.SiteId);
        });
    }
}
