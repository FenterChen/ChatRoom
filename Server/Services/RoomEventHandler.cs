using Newtonsoft.Json;
using Serilog;
using Server.Models;

namespace Server.Services
{
    public class RoomEventHandler
    {
        private readonly RoomManager _roomManager;
        private ErrorDto? _errorDto;
        private readonly Serilog.ILogger _serilog = Log.ForContext<RoomEventHandler>();
        static readonly HttpClient httpClient = new();
        private User? _user;

        public RoomEventHandler(RoomManager roomManager)
        {
            _roomManager = roomManager;
        }

        public void SetUser(User user)
        {
            _user = user;
        }

        public async Task CreateRoomAsync(string jsonStr)
        {
            ReceiveCreateRoom? receiveCreateRoom = JsonConvert.DeserializeObject<ReceiveCreateRoom>(jsonStr);
            if (receiveCreateRoom != null && receiveCreateRoom.Data.RoomId != null && receiveCreateRoom.Data.RoomType != null && _user?.Id != null)
            {
                RoomManangerStatus roomManangerStatus = await _roomManager.CreateRoomAsync(_user.Id, receiveCreateRoom.Data.RoomId, receiveCreateRoom.Data.RoomType);
                if (roomManangerStatus.Result)
                {
                    ReceiveJoinRoom receiveJoinRoom = new()
                    {
                        Data = new()
                        {
                            RoomId = receiveCreateRoom.Data.RoomId,
                            RoomType = receiveCreateRoom.Data.RoomType
                        }
                    };
                    string receiveJoinRoomJsonStr = JsonConvert.SerializeObject(receiveJoinRoom, new JsonSerializerSettings
                    {
                        DefaultValueHandling = DefaultValueHandling.Ignore
                    });
                    JoinRoom(receiveJoinRoomJsonStr);
                }
                else
                {
                    ErrorSendBack(nameof(MessageTypeDto.CreateRoom), roomManangerStatus.Message!);
                }
            }
            else
            {
                string message = $"Id:{_user?.Id}'s RoomId: {receiveCreateRoom?.Data?.RoomId}, RoomType:{receiveCreateRoom?.Data?.RoomType} is null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.CreateRoom), message);
            }
        }

        public void JoinRoom(string jsonStr)
        {
            ReceiveJoinRoom? receiveJoinRoom = JsonConvert.DeserializeObject<ReceiveJoinRoom>(jsonStr);
            string message;

            if (receiveJoinRoom != null && receiveJoinRoom.Data.RoomId != null && receiveJoinRoom.Data != null && _user?.Id != null)
            {
                var room = _roomManager.GetRoom(receiveJoinRoom.Data.RoomId);
                if (room == null)
                {
                    ErrorSendBack(nameof(MessageTypeDto.JoinRoom), $"The Room:{receiveJoinRoom.Data.RoomId} does not exist.");
                    return;
                }
                if (room.IsFull == true)
                {
                    ErrorSendBack(nameof(MessageTypeDto.JoinRoom), $"Id:{_user.Id} try to Join {receiveJoinRoom.Data.RoomId},but Room is full.");
                    return;
                }

                LeaveAndTryToCloseRoom();
                RoomManangerStatus roomManangerStatus = _roomManager.JoinRoom(_user.Id, receiveJoinRoom.Data.RoomId);

                //成功加入房間
                if (roomManangerStatus.Result)
                {
                    List<ReturnRoomInfo> returnRoomInfoList;

                    if (room.RoomType == RoomType.Lobby)
                    {
                        returnRoomInfoList = GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.UpdateLobby, null, room.RoomId);
                        foreach (ReturnRoomInfo returnRoomInfo in returnRoomInfoList)
                        {
                            Broadcast(null, returnRoomInfo.UserDto, returnRoomInfo.Room);
                        }
                    }
                    else
                    {
                        //Send back
                        returnRoomInfoList = GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.UpdateRoom, null, room.RoomId);

                        _user.Send(returnRoomInfoList[0].UserDto);


                        //Send NewUser to existing users in the room
                        returnRoomInfoList = GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.NewUser, _user.Id, room.RoomId);

                        //Send to existing users in the lobby
                        returnRoomInfoList.AddRange(GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.UpdateLobby, null, "Lobby"));
                        foreach (ReturnRoomInfo returnRoomInfo in returnRoomInfoList)
                        {
                            Broadcast(_user.Id, returnRoomInfo.UserDto, returnRoomInfo.Room);
                        }
                    }
                }
                else
                {
                    _serilog.Debug(roomManangerStatus.Message);
                    ErrorSendBack(nameof(MessageTypeDto.JoinRoom), roomManangerStatus.Message!);
                }
            }
            else
            {
                message = $"Id:{_user?.Id} try to Join {receiveJoinRoom?.Data?.RoomId},but RoomId parameter isn't given.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.JoinRoom), message);
            }
        }
        public void Offer(string jsonStr)
        {
            ReceiveOffer? receiveOffer = JsonConvert.DeserializeObject<ReceiveOffer>(jsonStr);
            if (receiveOffer != null && receiveOffer.Data.RecvId != null && receiveOffer.Data.Desc != null && receiveOffer.Data.RoomId != null && _roomManager.GetRoom(receiveOffer.Data.RoomId) != null && _user?.Id != null)
            {

                if (_roomManager.GetRoom(receiveOffer.Data.RoomId)!.CheckUser(_user.Id))
                {
                    SendOfferDto sendOfferDto = new()
                    {
                        Data = new OfferDto
                        {
                            ReqId = _user.Id,
                            Desc = receiveOffer.Data.Desc
                        }
                    };
                    Send(sendOfferDto, receiveOffer.Data.RecvId);
                }
            }
            else
            {
                string message = $"At least one of the parameters for Id:{_user?.Id}'s Desc:{receiveOffer?.Data.Desc},RecvId:{receiveOffer?.Data.RecvId},or RoomId:{receiveOffer?.Data.RoomId} provided is Null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.Offer), message);
            }
        }
        public void Answer(string jsonStr)
        {
            ReceiveAnswer? receiveAnswer = JsonConvert.DeserializeObject<ReceiveAnswer>(jsonStr);
            if (receiveAnswer != null && receiveAnswer.Data.Desc != null && receiveAnswer.Data.RecvId != null && receiveAnswer.Data.RoomId != null && _roomManager.GetRoom(receiveAnswer.Data.RoomId) != null && _user?.Id != null)
            {
                if (_roomManager.GetRoom(receiveAnswer.Data.RoomId)!.CheckUser(_user.Id))
                {
                    SendAnswerDto sendAnswerDto = new()
                    {
                        Data = new AnswerDto
                        {
                            ReqId = _user.Id,
                            Desc = receiveAnswer.Data.Desc
                        }
                    };

                    Send(sendAnswerDto, receiveAnswer.Data.RecvId);
                }
            }
            else
            {
                string message = $"At least one of the parameters for Id:{_user?.Id}'s Desc:{receiveAnswer?.Data.Desc},RecvId:{receiveAnswer?.Data.RecvId},or RoomId:{receiveAnswer?.Data.RoomId} provided is Null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.Answer), message);
            }
        }

        public void SendCandidate(string jsonStr)
        {
            ReceiveCandidate? receiveCandidate = JsonConvert.DeserializeObject<ReceiveCandidate>(jsonStr);
            if (receiveCandidate != null && receiveCandidate.Data.RecvId != null && receiveCandidate.Data.SdpMLineIndex != null && receiveCandidate.Data.SdpMid != null && receiveCandidate.Data.Candidate != null && receiveCandidate.Data.RoomId != null && _roomManager.GetRoom(receiveCandidate.Data.RoomId) != null && _user?.Id != null)
            {
                if (_roomManager.GetRoom(receiveCandidate.Data.RoomId)!.CheckUser(_user.Id))
                {
                    SendCandidateDto sendCandidateDto = new()
                    {
                        Data = new CandidateDto
                        {
                            ReqId = _user.Id,
                            SdpMLineIndex = receiveCandidate.Data.SdpMLineIndex,
                            SdpMid = receiveCandidate.Data.SdpMid,
                            Candidate = receiveCandidate.Data.Candidate
                        }
                    };

                    Send(sendCandidateDto, receiveCandidate.Data.RecvId);
                }
            }
            else
            {
                string message = $"At least one of the parameters for Id:{_user?.Id}'s RecvId:{receiveCandidate?.Data.RecvId},SdpMLineIndex:{receiveCandidate?.Data.SdpMLineIndex},SdpMid:{receiveCandidate?.Data.SdpMid},Candidate:{receiveCandidate?.Data.Candidate},or RoomId:{receiveCandidate?.Data.RoomId} provided is Null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.SendCandidate), message);
            }
        }

        public async Task GetIceServerlist(string jsonStr)
        {
            ReceiveGetIceServerlist? receiveGetIceServerlist = JsonConvert.DeserializeObject<ReceiveGetIceServerlist>(jsonStr);
            if (receiveGetIceServerlist != null && receiveGetIceServerlist.Data.RoomId != null && _user?.Id != null)
            {
                //using HttpResponseMessage response = await httpClient.GetAsync($"http://iceserver:3486/iceconfig?u={_user.Id}");
                using HttpResponseMessage response = await httpClient.GetAsync($"http://localhost:3486/iceconfig?u={_user.Id}");
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();
                IceServerList? iceServerList = JsonConvert.DeserializeObject<IceServerList>(responseBody, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore,
                    Formatting = Formatting.Indented
                });
                if (iceServerList != null)
                {
                    IceServerListDto iceServerListDto = new()
                    {
                        Data = iceServerList,
                    };
                    _user.Send(iceServerListDto);
                }
            }
            else
            {
                string message = $"The parameter for Id:{_user?.Id}'s RoomId:{receiveGetIceServerlist?.Data.RoomId} provided is Null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.GetIceServerlist), message);
            }
        }

        public void BroadcastMessage(string jsonStr)
        {
            ReceiveBroadcastMessage? receiveBroadcastMessage = JsonConvert.DeserializeObject<ReceiveBroadcastMessage>(jsonStr);
            if (receiveBroadcastMessage != null && receiveBroadcastMessage.Data.RoomId != null && receiveBroadcastMessage.Data.Message != null && _user?.Id != null)
            {
                if (_user.Room != null)
                {
                    SendBroadcastMessageDto sendBroadcastMessageDto = new()
                    {
                        Data = new MessageDto
                        {
                            MessageSender = _user.Id,
                            Message = receiveBroadcastMessage.Data.Message
                        }
                    };

                    Broadcast(_user.Id, sendBroadcastMessageDto, receiveBroadcastMessage.Data.RoomId);
                }
                else
                {
                    ErrorSendBack(nameof(MessageTypeDto.BroadcastMessage), $"BroadcastMessage: User is not in the room.");
                }
            }
            else
            {
                string message = $"At least one of the parameters for Id:{_user?.Id}'s RoomId:{receiveBroadcastMessage?.Data.RoomId},or Message:{receiveBroadcastMessage?.Data.Message} provided is Null.";
                _serilog.Debug(message);
                ErrorSendBack(nameof(MessageTypeDto.BroadcastMessage), message);
            }
        }
        private void LeaveAndTryToCloseRoom()
        {
            if (_user != null && _user.Id != null && _user.Room != null)
            {
                BaseRoom room = _user.Room;
                _user.Room.RemoveUser(_user.Id);

                _roomManager.TryCloseRoom(room.RoomId);

                if (room.RoomType == RoomType.Lobby)
                {
                    List<ReturnRoomInfo> returnRoomInfoList = GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.UserLeaveFromLobby, null, room.RoomId);
                    foreach (ReturnRoomInfo roomReturnInfo in returnRoomInfoList)
                    {
                        Broadcast(null, roomReturnInfo.UserDto, roomReturnInfo.Room);
                    }
                }
                else
                {
                    if (room.IsEmpty == false)
                    {
                        UserLeaveFromRoomDto userLeaveFromRoomDto = new()
                        {
                            Data = { RoomId = room.RoomId, RoomType = room.RoomType.ToString(), IsFull = room.IsFull, LeaveUser = _user.Id, UserList = room.GetAllUserId() }
                        };
                        Broadcast(null, userLeaveFromRoomDto, room.RoomId);
                    }

                    List<ReturnRoomInfo> returnRoomInfoList = GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType.UpdateLobby, null, "Lobby");
                    foreach (ReturnRoomInfo returnRoomInfo in returnRoomInfoList)
                    {
                        Broadcast(null, returnRoomInfo.UserDto, returnRoomInfo.Room);
                    }
                }
            }
        }
        private void Broadcast(string? excludedId, object DataDto, string roomId)
        {
            var room = _roomManager.GetRoom(roomId);
            room?.Broadcast(excludedId, DataDto);
        }

        private void Send(object DataDto, string id)
        {
            var user = _roomManager.GetUser(id);
            if (user != null)
            {
                user.Send(DataDto);
            }
            else
            {
                _serilog.Information($"Can't send to Id:{id},because Id:{id} does not exist.");
            }
        }
        //todo
        public void ErrorSendBack(string type, string message)
        {
            _errorDto = new()
            {
                Data = new()
                {
                    Type = type,
                    Message = message
                }
            };
            _user?.Send(_errorDto);
        }

        private List<ReturnRoomInfo> GenerateFormattedRoomInfo(GenerateFormattedRoomInfoType type, string? newUser, string destinationRoom)
        {
            UpdateLobbyDto updateLobbyUserDto = new();
            UpdateRoomDto updateRoomDto = new();
            NewUserDto newUserDto = new();
            List<ReturnRoomInfo> returnRoomInfoList = new();

            switch (type)
            {
                case GenerateFormattedRoomInfoType.UpdateLobby:
                case GenerateFormattedRoomInfoType.UserLeaveFromLobby:
                    {
                        foreach (var room in _roomManager.GetAllRoom())
                        {
                            updateLobbyUserDto.Data?.Add(new RoomInfo() { RoomId = room.RoomId, RoomType = room.RoomType.ToString(), IsFull = room.IsFull, IsPermanent = room.IsPermanent, UserList = room.GetAllUserId() });
                        }
                        returnRoomInfoList.Add(new ReturnRoomInfo { UserDto = updateLobbyUserDto, Room = destinationRoom });
                        break;
                    }
                case GenerateFormattedRoomInfoType.UpdateRoom:
                    {
                        var room = _roomManager.GetRoom(destinationRoom);

                        updateRoomDto.Data = new RoomInfo() { RoomId = destinationRoom, RoomType = room?.RoomType.ToString(), IsFull = room?.IsFull, IsPermanent = room?.IsPermanent, UserList = room?.GetAllUserId() };
                        returnRoomInfoList.Add(new ReturnRoomInfo { UserDto = updateRoomDto, Room = destinationRoom });
                        break;
                    }
                case GenerateFormattedRoomInfoType.NewUser:
                    {
                        var room = _roomManager.GetRoom(destinationRoom);
                        newUserDto.Data = new RoomInfo() { RoomId = destinationRoom, RoomType = room?.RoomType.ToString(), IsFull = room?.IsFull, NewUser = newUser, IsPermanent = room?.IsPermanent, UserList = room?.GetAllUserId() };
                        returnRoomInfoList.Add(new ReturnRoomInfo { UserDto = newUserDto, Room = destinationRoom });
                        break;
                    }
            }
            return returnRoomInfoList;
        }

        public void SocketCloseEvent()
        {
            if (_user?.Id != null)
            {
                LeaveAndTryToCloseRoom();
                _roomManager.RemoveUser(_user.Id);
                _serilog.Information($"RemoveUser: {_user.Id}");
            }
        }
    }
}
