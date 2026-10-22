using System.Net;
using System.Text.RegularExpressions;

namespace Torq.Api.Common;

public static class ContactLeakGuard
{
    private static readonly Regex Email = new(@"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex Phone = new(@"(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}", RegexOptions.Compiled);

    public static void EnsureClean(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return;
        }

        if (Email.IsMatch(text) || LooksLikePhone(text))
        {
            throw new AppException("Sharing phone numbers or personal email addresses is not allowed. Use the campaign workspace.", HttpStatusCode.BadRequest);
        }
    }

    private static bool LooksLikePhone(string text)
    {
        foreach (Match match in Phone.Matches(text))
        {
            var digits = match.Value.Count(char.IsDigit);
            if (digits >= 10)
            {
                return true;
            }
        }

        return false;
    }
}
