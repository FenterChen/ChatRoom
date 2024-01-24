using Serilog;
using Server.Models;
using System.Collections.Concurrent;

namespace Server.Services
{
    public class RoomManangerStatus
    {
        public bool Result { get; set; }
        public string Message { get; set; } = "";
    }

    public class RoomManager
    {
        private readonly Serilog.ILogger _serilog = Log.ForContext<RoomManager>();

        private readonly ConcurrentDictionary<string, User> users = new();
        private readonly ConcurrentDictionary<string, BaseRoom> rooms = new()
        {
            ["Lobby"] = new LobbyRoom("Lobby", true),
            ["Room01"] = new SingleRoom("Room01", true),
            ["Room02"] = new SingleRoom("Room02", true),
            ["Room03"] = new SingleRoom("Room03", true),
            ["Room04"] = new SingleRoom("Room04", true),
            ["Room05"] = new SingleRoom("Room05", true),
        };

        public User? GetUser(string userId)
        {
            users.TryGetValue(userId, out User? user);
            return user;
        }
        public void AddUser(User user)
        {
            if (user.Id != null)
            {
                users.TryAdd(user.Id, user);
            }
        }
        public User? RemoveUser(string userId)
        {
            users.Remove(userId, out User? user);
            return user;
        }

        private bool AddRoom(BaseRoom room)
        {
            return rooms.TryAdd(room.RoomId, room);
        }
        private BaseRoom? RemoveRoom(string roomId)
        {
            rooms.Remove(roomId, out BaseRoom? room);
            return room;
        }

        public BaseRoom? GetRoom(string roomId)
        {
            rooms.TryGetValue(roomId, out BaseRoom? room);
            return room;
        }
        public List<BaseRoom> GetAllRoom()
        {
            return rooms.Values.ToList();
        }
        public Task<RoomManangerStatus> CreateRoomAsync(string id, string roomName, string roomType)
        {
            string? message;
            bool result;
            switch (roomType)
            {
                case nameof(RoomType.Single):
                    {
                        var room = new SingleRoom(roomName, false);
                        result = AddRoom(room);
                        if (result)
                        {
                            message = $"Room:{roomName} was created by Id:{id}.";
                            _serilog.Information(message);
                        }
                        else
                        {
                            message = $"Id:{id} cannot create Room:{roomName} because an error occurred while creating the room.";
                        }
                    }
                    break;
                case nameof(RoomType.Multiple):
                    {
                        var room = new MultipleRoom(roomName, false);
                        result = AddRoom(room);
                        if (result)
                        {
                            message = $"Room:{roomName} was created by Id:{id}.";
                            _serilog.Information(message);
                        }
                        else
                        {
                            message = $"Id:{id} cannot create Room:{roomName} because an error occurred while creating the room.";
                        }
                    }
                    break;
                default:
                    {
                        result = false; message = $"Id:{id} cannot create Room:{roomName} because an error occurred while creating the room."; break;
                    }
            }

            RoomManangerStatus roomManangerStatus = new()
            {
                Result = result,
                Message = message
            };
            return Task.FromResult(roomManangerStatus);
        }

        public RoomManangerStatus JoinRoom(string userId, string roomId)
        {
            string? message;
            bool result;
            RoomManangerStatus roomManangerStatus = new();

            var user = GetUser(userId);
            if (userId == null || user == null)
            {
                message = $"JoinRoom: userId:{userId} or user is null.";
                roomManangerStatus.Result = false;
                _serilog.Warning(message);
            }
            var room = GetRoom(roomId);
            if (room == null)
            {
                message = $"JoinRoom: Room:{roomId} is null.";
                roomManangerStatus.Result = false;
                _serilog.Warning(message);
            }

            if (room!.AddUser(user!) == true)
            {
                result = true;
                message = $"Id:{userId} has joined Room:{roomId}.";
                _serilog.Information(message);
            }
            else
            {
                result = false;
                message = $"Id:{userId} failed to join Room:{roomId}.";
                _serilog.Information(message);
            }
            roomManangerStatus.Result = result;
            roomManangerStatus.Message = message;
            return roomManangerStatus;
        }

        public void TryCloseRoom(string roomId)
        {
            var room = GetRoom(roomId);
            if (room != null)
            {
                if (room.IsPermanent == false && room.IsEmpty == true)
                {
                    RemoveRoom(roomId);
                    _serilog.Information($"Room:{roomId} was closed.");
                }
            }
        }
    }
}
