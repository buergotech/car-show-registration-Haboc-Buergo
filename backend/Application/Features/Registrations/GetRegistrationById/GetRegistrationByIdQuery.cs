namespace Application.Features.Registrations.GetRegistrationById;

using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Application.Features.Registrations;
using Domain.Common;
using Microsoft.EntityFrameworkCore;

public sealed record GetRegistrationByIdQuery(Guid Id) : IQuery<Result<RegistrationView>>;

public sealed class GetRegistrationByIdQueryHandler(IAppDbContext dbContext)
    : IQueryHandler<GetRegistrationByIdQuery, Result<RegistrationView>>
{
    public async Task<Result<RegistrationView>> HandleAsync(
        GetRegistrationByIdQuery query,
        CancellationToken cancellationToken = default)
    {
        var registration = await dbContext.Registrations
            .AsNoTracking()
            .FirstOrDefaultAsync(registration => registration.Id == query.Id, cancellationToken);

        if (registration is null)
        {
            return Result<RegistrationView>.Failure(Error.NotFound(
                "Registration.NotFound",
                $"No registration was found with id '{query.Id}'."));
        }

        return Result<RegistrationView>.Success(RegistrationView.From(registration));
    }
}
