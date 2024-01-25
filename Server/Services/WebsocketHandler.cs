using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Serilog;
using Server.Models;

namespace Server.Services
{

    public class HeartbeatWebsocketHandler : WebsocketHandlerBase
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<HeartbeatWebsocketHandler>();
        private readonly RoomEventHandler _roomEventHandler;
        private HeartbeatEventHandler _heartbeatEventHandler;
        private User _user;

        public HeartbeatWebsocketHandler(RoomEventHandler roomEventHandler, User user)
        {
            _roomEventHandler = roomEventHandler;
            _heartbeatEventHandler = new HeartbeatEventHandler(_roomEventHandler);
            _user = user;
        }

        override public Task Start(WebsocketManager websocketManager)
        {
            _heartbeatEventHandler.Heartbeat(_user);
            return Task.CompletedTask;
        }

        override public Task Receive(WebsocketManager websocketManager, JObject jObject, string jsonStr)
        {
            try
            {
                if (jObject["Type"] != null)
                {
                    switch (jObject["Type"]!.ToString())
                    {
                        case nameof(MessageTypeDto.HeartBeat):
                            ReceiveHeartbeat? receiveHeartbeat = JsonConvert.DeserializeObject<ReceiveHeartbeat>(jsonStr);
                            _heartbeatEventHandler!.Start(_user!, receiveHeartbeat!);
                            break;
                    }
                }

            }
            catch (Exception e)
            {
                _serilog.Warning(e, $" HeartbeatWebsocketHandler Receive {_user?.Id}'s Exception");
            }
            return Task.CompletedTask;
        }

    }

    public class RoomWebsocketHandler : WebsocketHandlerBase
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<RoomWebsocketHandler>();
        private readonly RoomEventHandler _roomEventHandler;
        private User _user;

        public RoomWebsocketHandler(RoomEventHandler roomEventHandler, User user)
        {
            _roomEventHandler = roomEventHandler;
            _user = user;
        }

        override public Task Start(WebsocketManager websocketManager)
        {
            try
            {
                InitDataDto initDataDto = new()
                {
                    Data = new()
                    {
                        Id = _user.Id
                    }
                };
                _user.Send(initDataDto);
            }
            catch (Exception e)
            {
                _serilog.Warning(e, $" RoomWebsocketHandler Start {_user?.Id}'s Exception");
            }
            return Task.CompletedTask;
        }

        override public async Task Receive(WebsocketManager websocketManager, JObject jObject, string jsonStr)
        {
            try
            {
                if (jObject["Type"] != null)
                {
                    switch (jObject["Type"]!.ToString())
                    {
                        case nameof(MessageTypeDto.CreateRoom):
                            await _roomEventHandler.CreateRoomAsync(jsonStr);
                            break;
                        case nameof(MessageTypeDto.JoinRoom):
                            _roomEventHandler.JoinRoom(jsonStr  );
                            break;
                        case nameof(MessageTypeDto.Offer):
                            _roomEventHandler.Offer(jsonStr);
                            break;
                        case nameof(MessageTypeDto.Answer):
                            _roomEventHandler.Answer(jsonStr);
                            break;
                        case nameof(MessageTypeDto.SendCandidate):
                            _roomEventHandler.SendCandidate(jsonStr);
                            break;
                        case nameof(MessageTypeDto.GetIceServerlist):
                            await _roomEventHandler.GetIceServerlist(jsonStr);
                            break;
                        case nameof(MessageTypeDto.BroadcastMessage):
                            _roomEventHandler.BroadcastMessage(jsonStr);
                            break;
                    }
                }
            }
            catch (Exception e)
            {
                _serilog.Warning(e, $" RoomWebsocketHandler Receive {_user?.Id}'s Exception");
            }
        }

        override public Task Close(WebsocketManager websocketManager)
        {
            try
            {
                if (_user.Id != null)
                {
                    _serilog.Information($"Id:{_user.Id} was closed the websocket connection.");
                    _roomEventHandler.SocketCloseEvent();
                }
            }
            catch (Exception e)
            {
                _serilog.Warning(e, $" RoomWebsocketHandler Close {_user?.Id}'s Exception");
            }
            return Task.CompletedTask;
        }
    }
}