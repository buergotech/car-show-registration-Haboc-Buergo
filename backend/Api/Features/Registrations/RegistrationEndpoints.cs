namespace Api.Features.Registrations;

using Api.Common.Extensions;
using Api.Common.Filters;
using Application.Abstractions.Messaging;
using Application.Features.Registrations;
using Application.Features.Registrations.CreateRegistration;
using Application.Features.Registrations.GetRegistrationById;
using Application.Features.Registrations.GetRegistrations;
using Application.Features.Registrations.GetRegistrationSummary;
using Domain.Common;

public static class RegistrationEndpoints
{
    public static void MapRegistrationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/registrations")
            .WithTags("Registrations");

        group.MapPost("/", Create)
            .AddEndpointFilter<ValidationFilter<CreateRegistrationCommand>>()
            .WithName("CreateRegistration")
            .WithSummary("Register a participant and one car")
            .Produces<RegistrationView>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapGet("/", GetAll)
            .AddEndpointFilter<ValidationFilter<GetRegistrationsQuery>>()
            .WithName("GetRegistrations")
            .WithSummary("Paged list of registrations with optional filters")
            .Produces<PagedResult<RegistrationView>>()
            .ProducesValidationProblem();

        group.MapGet("/summary", GetSummary)
            .WithName("GetRegistrationSummary")
            .WithSummary("Totals for the dashboard KPI cards")
            .Produces<RegistrationSummary>();

        group.MapGet("/{id:guid}", GetById)
            .WithName("GetRegistrationById")
            .WithSummary("Find one registration by its identifier")
            .Produces<RegistrationView>()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> Create(
        CreateRegistrationCommand command,
        ICommandHandler<CreateRegistrationCommand, Result<RegistrationView>> handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(command, cancellationToken);

        return result.IsSuccess
            ? TypedResults.Created($"/api/registrations/{result.Value!.Id}", result.Value)
            : result.ToProblemDetails();
    }

    private static async Task<IResult> GetAll(
        [AsParameters] GetRegistrationsQuery query,
        IQueryHandler<GetRegistrationsQuery, Result<PagedResult<RegistrationView>>> handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(query, cancellationToken);

        return result.IsSuccess
            ? TypedResults.Ok(result.Value)
            : result.ToProblemDetails();
    }

    private static async Task<IResult> GetSummary(
        IQueryHandler<GetRegistrationSummaryQuery, Result<RegistrationSummary>> handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(new GetRegistrationSummaryQuery(), cancellationToken);

        return result.IsSuccess
            ? TypedResults.Ok(result.Value)
            : result.ToProblemDetails();
    }

    private static async Task<IResult> GetById(
        Guid id,
        IQueryHandler<GetRegistrationByIdQuery, Result<RegistrationView>> handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(new GetRegistrationByIdQuery(id), cancellationToken);

        return result.IsSuccess
            ? TypedResults.Ok(result.Value)
            : result.ToProblemDetails();
    }
}
