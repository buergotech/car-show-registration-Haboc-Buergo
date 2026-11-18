namespace Domain.Pricing;

using Domain.Enums;

public static class RegistrationPricing
{
    public static decimal FeeFor(RegistrationType registrationType) =>
        registrationType switch
        {
            RegistrationType.VIP => 5000m,
            RegistrationType.Competitor => 2500m,
            RegistrationType.Exhibitor => 1500m,
            _ => 0m
        };
}
