namespace Application.Features.Registrations.GetRegistrations;

using Domain.Enums;
using FluentValidation;

public sealed class GetRegistrationsValidator : AbstractValidator<GetRegistrationsQuery>
{
    public GetRegistrationsValidator()
    {
        RuleFor(query => query.ParticipantName)
            .MaximumLength(150);

        RuleFor(query => query.Type)
            .Must(BeARegistrationType)
            .When(query => !string.IsNullOrWhiteSpace(query.Type))
            .WithMessage("Type must be Exhibitor, Competitor or VIP.");

        RuleFor(query => query.Status)
            .Must(BeARegistrationStatus)
            .When(query => !string.IsNullOrWhiteSpace(query.Status))
            .WithMessage("Status must be Pending, Confirmed, CheckedIn or Cancelled.");

        RuleFor(query => query.Page)
            .GreaterThanOrEqualTo(1)
            .When(query => query.Page.HasValue)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, 50)
            .When(query => query.PageSize.HasValue)
            .WithMessage("Page size must be between 1 and 50.");
    }

    private static bool BeARegistrationType(string? value) =>
        Enum.TryParse<RegistrationType>(value, true, out var type) && Enum.IsDefined(type);

    private static bool BeARegistrationStatus(string? value) =>
        Enum.TryParse<RegistrationStatus>(value, true, out var status) && Enum.IsDefined(status);
}
