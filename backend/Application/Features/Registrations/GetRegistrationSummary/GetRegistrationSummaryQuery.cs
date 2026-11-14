namespace Application.Features.Registrations.GetRegistrationSummary;

using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Domain.Common;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

public sealed record GetRegistrationSummaryQuery : IQuery<Result<RegistrationSummary>>;

public sealed record RegistrationSummary(
    int TotalRegistrations,
    int Confirmed,
    int CheckedIn,
    int Pending,
    int Cancelled,
    decimal TotalFees,
    decimal TotalPayments,
    decimal UncollectedPayments);

public sealed class GetRegistrationSummaryQueryHandler(IAppDbContext dbContext)
    : IQueryHandler<GetRegistrationSummaryQuery, Result<RegistrationSummary>>
{
    public async Task<Result<RegistrationSummary>> HandleAsync(
        GetRegistrationSummaryQuery query,
        CancellationToken cancellationToken = default)
    {
        var registrations = dbContext.Registrations.AsNoTracking();

        var totalRegistrations = await registrations.CountAsync(cancellationToken);
        var confirmed = await registrations.CountAsync(
            registration => registration.Status == RegistrationStatus.Confirmed,
            cancellationToken);
        var checkedIn = await registrations.CountAsync(
            registration => registration.Status == RegistrationStatus.CheckedIn,
            cancellationToken);
        var pending = await registrations.CountAsync(
            registration => registration.Status == RegistrationStatus.Pending,
            cancellationToken);
        var cancelled = await registrations.CountAsync(
            registration => registration.Status == RegistrationStatus.Cancelled,
            cancellationToken);

        var money = await registrations
            .Where(registration => registration.Status != RegistrationStatus.Cancelled)
            .Select(registration => new { registration.RegistrationFee, registration.AmountPaid })
            .ToListAsync(cancellationToken);

        var totalFees = money.Sum(row => row.RegistrationFee);
        var totalPayments = money.Sum(row => row.AmountPaid);

        return Result<RegistrationSummary>.Success(new RegistrationSummary(
            totalRegistrations,
            confirmed,
            checkedIn,
            pending,
            cancelled,
            totalFees,
            totalPayments,
            totalFees - totalPayments));
    }
}
