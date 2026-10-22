using System.Net;

namespace Torq.Api.Common;

public sealed class AppException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public AppException(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest) : base(message)
    {
        StatusCode = statusCode;
    }
}
