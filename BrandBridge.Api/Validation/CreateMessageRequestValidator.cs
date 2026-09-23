using BrandBridge.Api.Contracts;
using FluentValidation;

namespace BrandBridge.Api.Validation;

public sealed class CreateMessageRequestValidator : AbstractValidator<CreateMessageRequest>
{
    public CreateMessageRequestValidator()
    {
        RuleFor(x => x.Body).NotEmpty().MaximumLength(8000);
    }
}
