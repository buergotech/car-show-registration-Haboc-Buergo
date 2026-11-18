namespace Infrastructure.Persistence;

using Application.Abstractions.Data;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public sealed class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Registration> Registrations => Set<Registration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var registration = modelBuilder.Entity<Registration>();

        registration.ToTable("Registrations");
        registration.HasKey(entity => entity.Id);

        registration.Property(entity => entity.RegistrationNumber)
            .IsRequired()
            .HasMaxLength(15);

        registration.Property(entity => entity.ParticipantName)
            .IsRequired()
            .HasMaxLength(150);

        registration.Property(entity => entity.ContactNumber)
            .IsRequired()
            .HasMaxLength(11);

        registration.Property(entity => entity.Email)
            .IsRequired()
            .HasMaxLength(200);

        registration.Property(entity => entity.Address)
            .IsRequired()
            .HasMaxLength(300);

        registration.Property(entity => entity.CarMakeModel)
            .IsRequired()
            .HasMaxLength(100);

        registration.Property(entity => entity.PlateNumber)
            .IsRequired()
            .HasMaxLength(15);

        registration.Property(entity => entity.RegistrationType)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        registration.Property(entity => entity.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        registration.Property(entity => entity.RegistrationFee)
            .HasConversion<double>()
            .IsRequired();

        registration.Property(entity => entity.AmountPaid)
            .HasConversion<double>()
            .IsRequired();

        registration.Property(entity => entity.RegistrationDate)
            .HasConversion(
                value => value,
                value => DateTime.SpecifyKind(value, DateTimeKind.Utc))
            .IsRequired();

        registration.Ignore(entity => entity.PaymentStatus);

        registration.HasIndex(entity => entity.RegistrationNumber)
            .IsUnique()
            .HasDatabaseName("IX_Registrations_RegistrationNumber");

        registration.HasIndex(entity => entity.PlateNumber)
            .IsUnique()
            .HasDatabaseName("IX_Registrations_PlateNumber");

        registration.HasIndex(entity => entity.RegistrationDate);
        registration.HasIndex(entity => entity.Status);
    }
}
