using Torq.Api.Common;
using Torq.Api.Contracts;
using Torq.Api.Domain.Enums;
using FluentValidation;

namespace Torq.Api.Validation;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(email => !string.IsNullOrWhiteSpace(email.Trim()))
            .WithMessage("Email is required.")
            .Must(EmailAddressRules.IsAcceptable)
            .WithMessage("A valid email address is required.");

        RuleFor(x => x.Email.Trim())
            .EmailAddress()
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("A valid email address is required.");

        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Role).Must(r => r is UserRole.Business or UserRole.Provider);
    }
}
