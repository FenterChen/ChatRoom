using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;
using System.Net.WebSockets;
using System.Text;

namespace Server.Services
{
    public class WebsocketHandlerBase
    {
        virtual public async Task Start(WebsocketManager websocketManager)
        {
            await Task.CompletedTask;
        }
        virtual public async Task Receive(WebsocketManager websocketManager, JObject jObject, string jsonStr)
        {
            await Task.CompletedTask;
        }
        virtual public async Task Close(WebsocketManager websocketManager)
        {
            await Task.CompletedTask;
        }
    }

    public class WebsocketManager
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<WebsocketManager>();
        private WebSocketReceiveResult? _receiveResult;
        private readonly List<WebsocketHandlerBase> websocketHandlers = new();
        private WebSocket? webSocket;
        private string? _userId;

        public void RegisterHandler(WebsocketHandlerBase websocketHandler,string? userId)
        {
            websocketHandlers.Add(websocketHandler);
            _userId = userId;
        }

        public bool IsOnline { get => webSocket?.State == WebSocketState.Open; }

        public async Task Send(object DataDto)
        {
            if (IsOnline)
            {
                string jsonStr = JsonConvert.SerializeObject(DataDto, new JsonSerializerSettings
                {
                    DefaultValueHandling = DefaultValueHandling.Ignore
                });
                byte[] sendBuffer = Encoding.UTF8.GetBytes(jsonStr);
                if (webSocket?.State == WebSocketState.Open)
                {
                    await webSocket.SendAsync(new ArraySegment<byte>(sendBuffer), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }

        public async Task Close()
        {
            if (webSocket != null)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
            }
        }

        public async Task Connect(Uri uri)
        {
            var webSocket = new ClientWebSocket();
            await webSocket.ConnectAsync(uri, CancellationToken.None);
            await Start(webSocket);
        }

        public async Task Start(WebSocket webSocket)
        {
            this.webSocket = webSocket;
            try
            {
                foreach (var handler in websocketHandlers)
                {
                    await handler.Start(this);
                }

                //Receive websocket
                while (true)
                {
                    List<byte> message = new();
                    while (true)
                    {
                        byte[] receiveBuffer = new byte[1024];
                        _receiveResult = await webSocket.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
                        message.AddRange(receiveBuffer.Take(_receiveResult.Count));
                        if (_receiveResult.EndOfMessage)
                            break;
                    }

                    if (_receiveResult.MessageType == WebSocketMessageType.Text)
                    {
                        try
                        {
                            string jsonStr = Encoding.UTF8.GetString(message.ToArray());
                            //Console.WriteLine(jsonStr);

                            JObject jObject = JObject.Parse(jsonStr);
                            foreach (var handler in websocketHandlers)
                            {
                                await handler.Receive(this, jObject, jsonStr);
                            }
                        }
                        catch (Exception e)
                        {
                            _serilog.Warning(e, $" WebsocketManager Receive Exception");
                        }
                    }

                    if (_receiveResult != null && _receiveResult.CloseStatus != null && _receiveResult.CloseStatus.HasValue && webSocket.State != WebSocketState.Closed)
                    {
                        await webSocket.CloseAsync(_receiveResult.CloseStatus.Value, _receiveResult.CloseStatusDescription, CancellationToken.None);
                        break;
                    }
                    else if (webSocket.State == WebSocketState.Closed)
                    {
                        break;
                    }
                }
            }
            catch (WebSocketException e)
            {
                if (e.WebSocketErrorCode== WebSocketError.ConnectionClosedPrematurely)
                {
                    _serilog.Information($"Id:{_userId}:The remote party closed the WebSocket connection without completing the close handshake.");
                }
                else
                {
                    _serilog.Debug($"Id:{_userId}:WebSocketException:{e}.");
                    _serilog.Debug($"Id:{_userId}:WebSocket.State:{webSocket!.State}");
                }
            }
            catch (Exception ex)
            {
                // others Exception
                _serilog.Warning($"Id:{_userId}:Exception:{ex}.");
            }
            finally
            {
                foreach (var handler in websocketHandlers)
                {
                    await handler.Close(this);
                }

                webSocket.Dispose();
            }
        }

    }
}
