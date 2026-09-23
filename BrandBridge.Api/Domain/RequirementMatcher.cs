using System.Linq.Expressions;
using BrandBridge.Api.Domain.Entities;
using BrandBridge.Api.Domain.Enums;

namespace BrandBridge.Api.Domain;

public static class RequirementMatcher
{
    public static string[] ParseServiceCategories(string? serviceCategories)
        => (serviceCategories ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    public static bool IsEligible(Requirement requirement, string? serviceCategories)
        => IsEligible(requirement, ParseServiceCategories(serviceCategories));

    public static bool IsEligible(Requirement requirement, IEnumerable<string> serviceCategories)
    {
        if (!IsOpenToProviders(requirement))
        {
            return false;
        }

        return serviceCategories.Contains(requirement.Category, StringComparer.OrdinalIgnoreCase);
    }

    public static Expression<Func<Requirement, bool>> EligibleFor(IReadOnlyCollection<string> serviceCategories)
    {
        var categories = serviceCategories
            .Select(category => category.Trim().ToLowerInvariant())
            .Where(category => category.Length > 0)
            .Distinct()
            .ToArray();

        return requirement =>
            requirement.Visibility == RequirementVisibility.PublicEligible
            && (requirement.Status == RequirementStatus.Open || requirement.Status == RequirementStatus.ProposalReview)
            && categories.Contains(requirement.Category.ToLower());
    }

    private static bool IsOpenToProviders(Requirement requirement)
        => requirement.Visibility == RequirementVisibility.PublicEligible
           && requirement.Status is RequirementStatus.Open or RequirementStatus.ProposalReview;
}
