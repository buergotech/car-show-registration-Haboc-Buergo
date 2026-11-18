namespace Application.Features.Registrations.GetRegistrations;

using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Application.Features.Registrations;
using Domain.Common;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;

public sealed class GetRegistrationsQueryHandler(IAppDbContext dbContext)
    : IQueryHandler<GetRegistrationsQuery, Result<PagedResult<RegistrationView>>>
{
    public async Task<Result<PagedResult<RegistrationView>>> HandleAsync(
        GetRegistrationsQuery query,
        CancellationToken cancellationToken = default)
    {
        var page = query.Page ?? 1;
        var pageSize = query.PageSize ?? 10;

        var registrations = dbContext.Registrations.AsNoTracking();

        if (Enum.TryParse<RegistrationType>(query.Type, true, out var type))
        {
            registrations = registrations.Where(registration => registration.RegistrationType == type);
        }

        if (Enum.TryParse<RegistrationStatus>(query.Status, true, out var status))
        {
            registrations = registrations.Where(registration => registration.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.ParticipantName))
        {
            var name = query.ParticipantName.Trim().ToLower();
            registrations = registrations.Where(registration => registration.ParticipantName.ToLower().Contains(name));
        }

        var totalCount = await registrations.CountAsync(cancellationToken);

        var rows = await registrations
            .OrderByDescending(registration => registration.RegistrationDate)
            .ThenByDescending(registration => registration.RegistrationNumber)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = rows.Select(RegistrationView.From).ToList();
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return Result<PagedResult<RegistrationView>>.Success(
            new PagedResult<RegistrationView>(items, page, pageSize, totalCount, totalPages));
    }
}
