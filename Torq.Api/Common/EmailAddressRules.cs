using System.ComponentModel.DataAnnotations;

namespace Torq.Api.Common;

/// <summary>
/// Rejects blank addresses and addresses ASP.NET Identity would refuse.
/// Identity checks format with <see cref="EmailAddressAttribute"/> and, because the
/// username is the email, only allows its default username character set.
/// This does not look up mail servers.
/// </summary>
public static class EmailAddressRules
{
    private const string IdentityUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    public static bool IsAcceptable(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return false;
        }

        var trimmed = email.Trim();
        if (trimmed.Length == 0 || !new EmailAddressAttribute().IsValid(trimmed))
        {
            return false;
        }

        foreach (var character in trimmed)
        {
            if (!IdentityUserNameCharacters.Contains(character))
            {
                return false;
            }
        }

        return true;
    }
}
