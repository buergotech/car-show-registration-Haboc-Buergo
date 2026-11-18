namespace Application.Features.Registrations.CreateRegistration;

using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Application.Features.Registrations;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Pricing;
using Microsoft.EntityFrameworkCore;

public sealed class CreateRegistrationCommandHandler(IAppDbContext dbContext)
    : ICommandHandler<CreateRegistrationCommand, Result<RegistrationView>>
{
    private const string NumberPrefix = "CS27-";

    public async Task<Result<RegistrationView>> HandleAsync(
        CreateRegistrationCommand command,
        CancellationToken cancellationToken = default)
    {
        var plateNumber = NormalizePlateNumber(command.PlateNumber);

        var plateTaken = await dbContext.Registrations
            .AnyAsync(registration => registration.PlateNumber == plateNumber, cancellationToken);

        if (plateTaken)
        {
            return DuplicatePlate(plateNumber);
        }

        var type = Enum.Parse<RegistrationType>(command.RegistrationType, true);

        var registration = new Registration
        {
            Id = Guid.NewGuid(),
            RegistrationNumber = await BuildRegistrationNumberAsync(cancellationToken),
            RegistrationDate = DateTime.UtcNow,
            ParticipantName = command.ParticipantName.Trim(),
            ContactNumber = command.ContactNumber.Trim(),
            Email = command.Email.Trim(),
            Address = command.Address.Trim(),
            CarMakeModel = command.CarMakeModel.Trim(),
            PlateNumber = plateNumber,
            RegistrationType = type,
            Status = RegistrationStatus.Pending,
            RegistrationFee = RegistrationPricing.FeeFor(type),
            AmountPaid = command.AmountPaid
        };

        dbContext.Registrations.Add(registration);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return DuplicatePlate(plateNumber);
        }

        return Result<RegistrationView>.Success(RegistrationView.From(registration));
    }

    private async Task<string> BuildRegistrationNumberAsync(CancellationToken cancellationToken)
    {
        var lastNumber = await dbContext.Registrations
            .AsNoTracking()
            .OrderByDescending(registration => registration.RegistrationNumber)
            .Select(registration => registration.RegistrationNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;

        if (lastNumber is not null
            && lastNumber.StartsWith(NumberPrefix, StringComparison.Ordinal)
            && int.TryParse(lastNumber[NumberPrefix.Length..], out var sequence))
        {
            next = sequence + 1;
        }

        return $"{NumberPrefix}{next:D4}";
    }

    private static string NormalizePlateNumber(string plateNumber) =>
        string.Join(' ', plateNumber.Trim().ToUpperInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries));

    private static Result<RegistrationView> DuplicatePlate(string plateNumber) =>
        Result<RegistrationView>.Failure(Error.Conflict(
            "Registration.Conflict",
            $"Plate number '{plateNumber}' already has a registration. One car can only register once."));
}
