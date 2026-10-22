using Torq.Api.Contracts;
using FluentValidation;

namespace Torq.Api.Validation;

public sealed class CreateRequirementRequestValidator : AbstractValidator<CreateRequirementRequest>
{
    public CreateRequirementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.Goal).NotEmpty();
        RuleFor(x => x.ExpectedDeliverables).NotEmpty();
        RuleFor(x => x.BudgetMax).GreaterThanOrEqualTo(x => x.BudgetMin).When(x => x.BudgetMin.HasValue && x.BudgetMax.HasValue);
    }
}
