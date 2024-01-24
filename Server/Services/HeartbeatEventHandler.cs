using Serilog;
using Server.Models;
using SignalingServer.Util;
using System.Net.WebSockets;
using static SignalingServer.Util.CountdownTimer;

namespace Server.Services
{

    public class HeartbeatEventHandler
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<HeartbeatEventHandler>();
        private CountdownTimer? _countdownTimer;
        private Heartbeat? _heartbeat;
        private readonly RoomEventHandler _roomEventHandler;
        private Action? _timerEventHandler;

        public HeartbeatEventHandler(RoomEventHandler roomEventHandler)
        {
            _roomEventHandler = roomEventHandler;
        }
        public void Heartbeat(User user)
        {
            _serilog.Information("Id:{_id} have heartbeat checking enabled.", user.Id);
            _countdownTimer = new CountdownTimer(TimerFunctionEnum.SocketHeartBeat);
            _countdownTimer.Start();
            _heartbeat = new()
            {
                CheckString = "Ping"
            };
            user.Send("HeartBeat", 0, _heartbeat);
            _serilog.Verbose("Server send Ping to Id:{_id}.", user.Id);

            _countdownTimer.ExpiredTimerEvent += async () =>
            {
                try
                {
                    if (user.IsOnline == true && user.Id != null)
                    {
                        await user.Close();
                        _roomEventHandler.SocketCloseEvent();
                        _countdownTimer.Remove();
                        _serilog.Information("Id:{_id} was closed the websocket connection,because the CountdownTimer's Timer is up.", user.Id);
                    }
                }
                catch (WebSocketException e)
                {
                    _serilog.Warning($"{user.Id}'s Exception:{e}.");
                }
                catch (Exception ex)
                {
                    // others Exception
                    _serilog.Warning($"An unexpected exception occurred: userId:{user.Id}'s {ex}");
                }
            };
        }
        public void Start(User user, ReceiveHeartbeat receiveHeartbeat)
        {
            try
            {

                if (receiveHeartbeat?.Data.CheckString == "Pong")
                {
                    if (_countdownTimer != null)
                    {
                        if (_timerEventHandler == null)
                        {
                            _timerEventHandler = () => HeartbeatTimerEventHandler(user);
                            _countdownTimer.TimerEvent += _timerEventHandler;
                        }
                        _countdownTimer.Start();
                    }
                }
                else
                {
                    string message = $"Id:{user.Id} provided data that does not exist.";
                    _serilog.Information(message);
                    var errorDto = new ErrorDto()
                    {
                        Data = new()
                        {
                            Type = nameof(MessageTypeDto.HeartBeat),
                            Message = message
                        }
                    };
                    user.Send(errorDto);
                }
            }
            catch (WebSocketException e)
            {
                _serilog.Warning(e, $"{user.Id}'s Exception::{e}.");
            }

        }
        private void HeartbeatTimerEventHandler(User user)
        {
            if (_heartbeat != null)
            {
                user.Send("HeartBeat", 0, _heartbeat);
                _serilog.Verbose($"Server send Ping to Id:{user.Id}.");
            }
        }
    }
}
