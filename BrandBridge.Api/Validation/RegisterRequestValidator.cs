using BrandBridge.Api.Contracts;
using BrandBridge.Api.Domain.Enums;
using FluentValidation;

namespace BrandBridge.Api.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Role).Must(r => r is UserRole.Business or UserRole.Provider);
    }
}
