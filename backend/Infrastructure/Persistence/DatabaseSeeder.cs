namespace Infrastructure.Persistence;

using System.Globalization;
using Domain.Entities;
using Domain.Enums;
using Domain.Pricing;
using Microsoft.EntityFrameworkCore;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Registrations.AnyAsync(cancellationToken))
        {
            return;
        }

        dbContext.Registrations.AddRange(SeedRegistrations());
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IEnumerable<Registration> SeedRegistrations()
    {
        yield return Create(1, "2026-10-05T01:20:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d01", "Juan Dela Cruz", "09171234567", "juan.delacruz@example.com", "123 Rizal St., Naga City", "Toyota Supra MK4", "ABC 1234", RegistrationType.Competitor, RegistrationStatus.Pending, 1000m);
        yield return Create(2, "2026-10-05T03:45:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d02", "Ana Reyes", "09182345678", "ana.reyes@example.com", "45 Peñafrancia Ave., Naga City", "Honda Civic Type R", "NCR 4821", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1500m);
        yield return Create(3, "2026-10-05T06:10:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d03", "Marco Villanueva", "09193456789", "marco.villanueva@example.com", "Pangpang, Sorsogon City", "Nissan GT-R R35", "SOR 7742", RegistrationType.VIP, RegistrationStatus.CheckedIn, 5000m);
        yield return Create(4, "2026-10-06T01:05:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d04", "Liza Fernandez", "09204567890", "liza.fernandez@example.com", "Bulusan, Sorsogon", "Mazda MX-5", "ABC 9087", RegistrationType.Exhibitor, RegistrationStatus.Cancelled, 0m);
        yield return Create(5, "2026-10-06T04:30:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d05", "Carlo Mendoza", "09215678901", "carlo.mendoza@example.com", "Bacon, Sorsogon City", "Subaru WRX STI", "NCR 3311", RegistrationType.VIP, RegistrationStatus.Pending, 2500m);
        yield return Create(6, "2026-10-06T07:15:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d06", "Grace Lim", "09226789012", "grace.lim@example.com", "Rizal St., Sorsogon City", "Toyota GR86", "SOR 5520", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1500m);
        yield return Create(7, "2026-10-07T02:40:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d07", "Ramon Bautista", "09237890123", "ramon.bautista@example.com", "Pilar, Sorsogon", "Mitsubishi Lancer Evo X", "ABC 1145", RegistrationType.Competitor, RegistrationStatus.CheckedIn, 800m);
        yield return Create(8, "2026-10-07T05:25:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d08", "Sofia Ramirez", "09248901234", "sofia.ramirez@example.com", "Casiguran, Sorsogon", "BMW M4 Competition", "NCR 6600", RegistrationType.VIP, RegistrationStatus.Cancelled, 5000m);
        yield return Create(9, "2026-10-07T08:00:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d09", "Diego Torres", "09259012345", "diego.torres@example.com", "Gubat, Sorsogon", "Ford Mustang GT", "SOR 2213", RegistrationType.Competitor, RegistrationStatus.Pending, 0m);
        yield return Create(10, "2026-10-08T01:30:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d10", "Camille Ong", "09260123456", "camille.ong@example.com", "Castilla, Sorsogon", "Audi RS5", "ABC 7788", RegistrationType.VIP, RegistrationStatus.Confirmed, 5000m);
        yield return Create(11, "2026-10-08T04:05:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d11", "Enrique Navarro", "09271234567", "enrique.navarro@example.com", "Magallanes, Sorsogon", "Jeep Wrangler Rubicon", "NCR 9021", RegistrationType.Exhibitor, RegistrationStatus.CheckedIn, 1500m);
        yield return Create(12, "2026-10-08T06:50:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d12", "Patricia Gomez", "09282345678", "patricia.gomez@example.com", "Donsol, Sorsogon", "Hyundai Elantra N", "SOR 1140", RegistrationType.Exhibitor, RegistrationStatus.Pending, 500m);
        yield return Create(13, "2026-10-09T02:15:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d13", "Rodrigo Salazar", "09173456789", "rodrigo.salazar@example.com", "Matnog, Sorsogon", "Kia Stinger GT", "ABC 4456", RegistrationType.Competitor, RegistrationStatus.Confirmed, 2500m);
        yield return Create(14, "2026-10-10T05:15:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d14", "Jasmine Tan", "09184567890", "jasmine.tan@example.com", "Irosin, Sorsogon", "Mercedes-Benz AMG C63", "NCR 1876", RegistrationType.VIP, RegistrationStatus.CheckedIn, 3000m);
        yield return Create(15, "2026-10-11T01:55:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d15", "Fernando Castro", "09195678901", "fernando.castro@example.com", "Juban, Sorsogon", "Lexus IS 350", "SOR 8890", RegistrationType.VIP, RegistrationStatus.Confirmed, 5000m);
        yield return Create(16, "2026-10-13T03:20:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d16", "Isabel Domingo", "09206789012", "isabel.domingo@example.com", "Barcelona, Sorsogon", "Volkswagen Golf GTI", "ABC 2201", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1500m);
        yield return Create(17, "2026-10-15T06:40:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d17", "Manuel Rivera", "09217890123", "manuel.rivera@example.com", "Prieto Diaz, Sorsogon", "Chevrolet Camaro SS", "NCR 4455", RegistrationType.Exhibitor, RegistrationStatus.Pending, 0m);
        yield return Create(18, "2026-10-18T02:10:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d18", "Teresa Manalo", "09228901234", "teresa.manalo@example.com", "Sta. Magdalena, Sorsogon", "Porsche 911 Carrera", "SOR 6677", RegistrationType.VIP, RegistrationStatus.CheckedIn, 3000m);
        yield return Create(19, "2026-10-21T04:35:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d19", "Arthur Villamor", "09239012345", "arthur.villamor@example.com", "Bulan, Sorsogon", "Land Rover Defender", "ABC 3399", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1500m);
        yield return Create(20, "2026-10-24T07:05:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d20", "Michelle Padilla", "09170123456", "michelle.padilla@example.com", "Matnog Port Road, Sorsogon", "Mini Cooper S JCW", "NCR 5533", RegistrationType.Exhibitor, RegistrationStatus.Pending, 500m);
        yield return Create(21, "2026-10-27T01:45:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d21", "Victor Lorenzo", "09181234567", "victor.lorenzo@example.com", "Buenavista, Sorsogon", "Toyota Hilux GR-S", "SOR 3300", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1500m);
        yield return Create(22, "2026-10-30T03:30:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d22", "Bianca Cruz", "09192345678", "bianca.cruz@example.com", "Sorsogon City Hall Road", "Chevrolet Corvette C8", "ABC 9900", RegistrationType.VIP, RegistrationStatus.Confirmed, 1500m);
        yield return Create(23, "2026-11-02T06:00:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d23", "Nestor Aquino", "09203456789", "nestor.aquino@example.com", "Pilar, Sorsogon", "Honda S2000", "NCR 2211", RegistrationType.Exhibitor, RegistrationStatus.CheckedIn, 1500m);
        yield return Create(24, "2026-11-06T02:20:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d24", "Carla Dizon", "09214567890", "carla.dizon@example.com", "Casiguran, Sorsogon", "Nissan 370Z Nismo", "SOR 4412", RegistrationType.Exhibitor, RegistrationStatus.Confirmed, 1200m);
        yield return Create(25, "2026-11-10T05:10:00Z", "34e8a1f0-1c2b-4a58-9d31-0f0a1b2c3d25", "Rafael Espino", "09225678901", "rafael.espino@example.com", "Gubat, Sorsogon", "Mazda RX-7 FD", "ABC 5566", RegistrationType.Exhibitor, RegistrationStatus.Cancelled, 0m);
    }

    private static Registration Create(
        int sequence,
        string registrationDate,
        string id,
        string participantName,
        string contactNumber,
        string email,
        string address,
        string carMakeModel,
        string plateNumber,
        RegistrationType registrationType,
        RegistrationStatus status,
        decimal amountPaid) =>
        new()
        {
            Id = Guid.Parse(id),
            RegistrationNumber = $"CS27-{sequence:D4}",
            RegistrationDate = DateTime.Parse(
                registrationDate,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal),
            ParticipantName = participantName,
            ContactNumber = contactNumber,
            Email = email,
            Address = address,
            CarMakeModel = carMakeModel,
            PlateNumber = plateNumber,
            RegistrationType = registrationType,
            Status = status,
            RegistrationFee = RegistrationPricing.FeeFor(registrationType),
            AmountPaid = amountPaid
        };
}
