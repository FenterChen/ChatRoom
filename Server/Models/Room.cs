using Serilog;
using System.Collections.Concurrent;

namespace Server.Models
{
    public enum RoomType
    {
        Lobby = 1,
        Single = 2,
        Multiple = 3,
    }

    public class BaseRoom
    {
        public string RoomId { get; private set; }

        public virtual RoomType RoomType { get; }

        public virtual bool IsFull { get; } = false;


        public bool IsPermanent { get; set; } = false;

        protected ConcurrentDictionary<string, User> Users = new();
        private readonly Serilog.ILogger _serilog = Log.ForContext<BaseRoom>();

        public BaseRoom(string roomId, bool isPermanent)
        {
            RoomId = roomId;
            IsPermanent = isPermanent;
        }

        public virtual bool IsEmpty
        {
            get { return Users.Count == 0; }
        }

        public virtual bool AddUser(User user)
        {
            if (user.Id != null)
            {
                Users[user.Id] = user;
                user.Room = this;
                return true;
            }
            else
            {
                return false;
            }
        }

        public virtual bool CheckUser(string userId)
        {
            return Users.TryGetValue(userId, out _);
        }

        public virtual User? RemoveUser(string userId)
        {
            Users.Remove(userId, out User? user);
            if (user != null)
            {
                _serilog.Information($"Id:{userId} has left Room:{user.Room?.RoomId}");
                user.Room = null;
            }
            return user;
        }

        public virtual List<string> GetAllUserId()
        {
            return Users.Keys.ToList();
        }

        public void Broadcast(string? excludedId, object DataDto)
        {
            foreach (var user in Users.Values)
            {
                if (excludedId == null)
                {
                    //all Broadcast
                    user.Send(DataDto);
                }
                else if (excludedId != user.Id && user.Id != null)
                {
                    //Broadcast to everyone but myself
                    user.Send(DataDto);
                }
            }
        }

    }

    public class LobbyRoom : BaseRoom
    {
        override public RoomType RoomType { get; } = RoomType.Lobby;

        public LobbyRoom(string roomId, bool isPermanent) : base(roomId, isPermanent)
        {
        }
    }

    public class SingleRoom : BaseRoom
    {
        override public RoomType RoomType { get; } = RoomType.Single;

        override public bool IsFull
        {
            get { return Users.Count() >= 2; }
        }

        public SingleRoom(string roomId, bool isPermanent) : base(roomId, isPermanent)
        {
        }
    }
    public class MultipleRoom : BaseRoom
    {
        override public RoomType RoomType { get; } = RoomType.Multiple;

        public MultipleRoom(string roomId, bool isPermanent) : base(roomId, isPermanent)
        {
        }
    }
}
