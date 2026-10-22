using Torq.Api.Contracts;
using FluentValidation;

namespace Torq.Api.Validation;

public sealed class UpsertProposalRequestValidator : AbstractValidator<UpsertProposalRequest>
{
    public UpsertProposalRequestValidator()
    {
        RuleFor(x => x.RequirementId).NotEmpty();
        RuleFor(x => x.PriceAmount).GreaterThan(0);
        RuleFor(x => x.ScopeOfWork).NotEmpty();
        RuleFor(x => x.Deliverables).NotEmpty();
        RuleFor(x => x.TimelineDays).GreaterThan(0);
    }
}
