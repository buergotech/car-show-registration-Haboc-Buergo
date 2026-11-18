namespace Application.Features.Registrations.GetRegistrations;

using Application.Abstractions.Messaging;
using Application.Features.Registrations;
using Domain.Common;

public sealed record GetRegistrationsQuery(
    string? ParticipantName = null,
    string? Type = null,
    string? Status = null,
    int? Page = null,
    int? PageSize = null) : IQuery<Result<PagedResult<RegistrationView>>>;
