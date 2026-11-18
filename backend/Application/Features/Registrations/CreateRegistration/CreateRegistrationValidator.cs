namespace Application.Features.Registrations.CreateRegistration;

using Domain.Enums;
using Domain.Pricing;
using FluentValidation;

public sealed class CreateRegistrationValidator : AbstractValidator<CreateRegistrationCommand>
{
    public CreateRegistrationValidator()
    {
        RuleFor(command => command.ParticipantName)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Participant Name")
            .MaximumLength(150).WithName("Participant Name");

        RuleFor(command => command.ContactNumber)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Contact Number")
            .Matches(@"^09\d{9}$")
            .WithName("Contact Number")
            .WithMessage("'Contact Number' must follow the 09XXXXXXXXX format.");

        RuleFor(command => command.Email)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Email")
            .MaximumLength(200).WithName("Email")
            .EmailAddress().WithName("Email")
            .WithMessage("'Email' must be a valid email address.");

        RuleFor(command => command.Address)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Address")
            .MaximumLength(300).WithName("Address");

        RuleFor(command => command.CarMakeModel)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Car Make and Model")
            .MaximumLength(100).WithName("Car Make and Model");

        RuleFor(command => command.PlateNumber)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithName("Plate Number")
            .MaximumLength(15).WithName("Plate Number");

        RuleFor(command => command.RegistrationType)
            .Must(BeARegistrationType)
            .WithName("Registration Type")
            .WithMessage("'Registration Type' must be Exhibitor, Competitor or VIP.");

        RuleFor(command => command.AmountPaid)
            .GreaterThanOrEqualTo(0m)
            .WithName("Amount Paid")
            .WithMessage("'Amount Paid' must be 0 or more.");

        RuleFor(command => command.AmountPaid)
            .Must((command, amountPaid) => !ExceedsFee(command.RegistrationType, amountPaid))
            .WithName("Amount Paid")
            .WithMessage(command => $"'Amount Paid' cannot be more than the fee ({FeeFor(command.RegistrationType):N2}).");
    }

    private static bool BeARegistrationType(string value) =>
        Enum.TryParse<RegistrationType>(value, true, out var type) && Enum.IsDefined(type);

    private static bool ExceedsFee(string registrationType, decimal amountPaid)
    {
        if (!Enum.TryParse<RegistrationType>(registrationType, true, out var type) || !Enum.IsDefined(type))
        {
            return false;
        }

        return amountPaid > RegistrationPricing.FeeFor(type);
    }

    private static decimal FeeFor(string registrationType) =>
        Enum.TryParse<RegistrationType>(registrationType, true, out var type) && Enum.IsDefined(type)
            ? RegistrationPricing.FeeFor(type)
            : 0m;
}
