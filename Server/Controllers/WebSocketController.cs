using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace Server.Controllers
{
    public class WebSocketController : ControllerBase
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<WebSocketController>();
        [HttpGet("/ws")]
        public async Task Get()
        {
            try
            {
            }
            catch (Exception ex)
            {
                _serilog.Warning(ex, $"WebSocketController Exception:");
            }
        }
    }
}
