using Microsoft.AspNetCore.Mvc;
using Serilog;
using Server.Models;
using Server.Services;

namespace Server.Controllers
{
    public class WebSocketController : ControllerBase
    {
        private readonly RoomEventHandler _roomEventHandler;
        private readonly RoomManager _roomManager;
        private WebsocketManager _websocketManager;
        private readonly Serilog.ILogger _serilog = Log.ForContext<WebSocketController>();
        private User? _user;
        public WebSocketController(RoomManager roomManager)
        {
            _roomManager = roomManager;
            _roomEventHandler = new(_roomManager);
            _websocketManager = new();
        }

        [HttpGet("/")]
        public string Home()
        {
            HttpContext.Response.StatusCode = StatusCodes.Status200OK;
            return "Hello";
        }

        [HttpGet("/ws")]
        public async Task Get(bool heartbeat)
        {
            try
            {
                if (HttpContext.WebSockets.IsWebSocketRequest == false)
                {
                    HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
                    return;
                }
                _user = new User();
                _roomManager.AddUser(_user);

                string SecWebSocketProtocol = HttpContext.Request.Headers["Sec-WebSocket-Protocol"]!;
                string[] pathSegments = SecWebSocketProtocol.Split(',');
                var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync(pathSegments[0].Trim());
                _user.SetWebsocketManager(_websocketManager);
                _roomEventHandler.SetUser(_user);

                // 註冊WebsocketHandler
                var roomWebsocketHandler = new RoomWebsocketHandler(_roomEventHandler, _user);
                _websocketManager.RegisterHandler(roomWebsocketHandler, _user.Id);

                //如果有啟用心跳機制
                if (heartbeat == true)
                {
                    var _heartbeatEventHandler = new HeartbeatWebsocketHandler(_roomEventHandler, _user);
                    _websocketManager.RegisterHandler(_heartbeatEventHandler, _user.Id);
                }

                await _websocketManager.Start(webSocket);
            }
            catch (Exception ex)
            {
                _serilog.Warning(ex, $"WebSocketController Exception:");
            }
        }
    }
}
