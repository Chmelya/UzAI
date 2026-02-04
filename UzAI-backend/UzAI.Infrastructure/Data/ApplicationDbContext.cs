using Microsoft.EntityFrameworkCore;
using UzAI.Domain.Models;

namespace UzAI.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<UsageRecord> UsageRecords => Set<UsageRecord>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<Sprint> Sprints => Set<Sprint>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Sprint>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasMany(x => x.Tickets)
                .WithOne(x => x.Sprint)
                .HasForeignKey(x => x.SprintId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Employee>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasMany(x => x.AssignedTickets)
                .WithOne(x => x.Employee)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Ticket>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Number).IsUnique();
            e.HasOne(x => x.UsageRecord)
                .WithOne(x => x.Ticket)
                .HasForeignKey<UsageRecord>(x => x.TicketId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UsageRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
