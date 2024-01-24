
namespace SignalingServer.MiddleWare
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {

            if (context.Request.Path.StartsWithSegments("/ws") && context.Request.Headers.ContainsKey("Sec-WebSocket-Protocol"))
            {

                string SecWebSocketProtocol = context.Request.Headers["Sec-WebSocket-Protocol"]!;
                if (SecWebSocketProtocol == "")
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return;
                }
                string[] pathSegments = SecWebSocketProtocol.Split(',');
                string key = pathSegments[0].Trim();
                string value = pathSegments[1].Trim();

                if (key == "UserKey" && value != null)
                {
                    
                    if (value== "YYePXAUFQFM4c56f")
                    {
                        await _next(context);
                    }
                    else
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    }
                }
                else
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                }
            }
            else
            {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
            }
        }
    }
    public static class RequestCultureMiddlewareExtensions
    {
        public static IApplicationBuilder AuthenticationMiddleware(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AuthenticationMiddleware>();
        }
    }
}
