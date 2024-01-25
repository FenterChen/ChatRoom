using Newtonsoft.Json;

namespace Server.Models
{
    public class RoomInfo
    {
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public bool? IsFull { get; set; }
        public string? NewUser { get; set; }
        public bool? IsPermanent { get; set; }
        public SrsConnectionInfo? SrsConnectionInfo { get; set; }
        public ICollection<string>? UserList { get; set; }
    }
    public class LeftUser
    {
        public string? RoomId { get; set; }
        public string? RoomType { get; set; }
        public bool? IsFull { get; set; }
        public string? LeaveUser { get; set; }
        public ICollection<string>? UserList { get; set; }
    }

    public class NewUserDto
    {
        public RoomInfo Data { get; set; } = new();
        public string Type = nameof(MessageTypeDto.NewUser);
    }
    public class UserLeaveFromRoomDto
    {
        public LeftUser Data { get; set; } = new();
        public string Type = nameof(MessageTypeDto.UserLeaveFromRoom);
    }
    public class UpdateRoomDto
    {
        public RoomInfo Data { get; set; } = new();
        public string Type = nameof(MessageTypeDto.UpdateRoom);
    }
    public class UpdateLobbyDto
    {
        public List<RoomInfo> Data { get; set; } = new();
        public string Type = nameof(MessageTypeDto.UpdateLobby);
    }

    public class RefreshSrsToken
    {
        public string? Token { get; set; } = null;
    }

    public class OfferDto
    {
        public string? ReqId { get; set; }
        public Desc Desc { get; set; } = new();
    }

    public class SendOfferDto
    {
        public OfferDto Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.Offer);
    }
    public class AnswerDto
    {
        public string? ReqId { get; set; }
        public Desc? Desc { get; set; }
    }

    public class SendAnswerDto
    {
        public AnswerDto Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.Answer);
    }

    public class SendCandidateDto
    {
        public CandidateDto? Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.Candidate);
    }
    public class CandidateDto
    {
        public string? ReqId { get; set; }
        public string? SdpMLineIndex { get; set; }
        public string? SdpMid { get; set; }
        public string? Candidate { get; set; }
    }
    public class SendMessageDto
    {
        public MessageDto Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.Message);
    }
    public class SendBroadcastMessageDto
    {
        public MessageDto Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.BroadcastMessage);
    }

    public class MessageDto
    {
        public string? MessageSender { get; set; }
        public string? Message { get; set; }
    }

    public class IceServers
    {
        [JsonProperty("urls")]
        public string? Urls { get; set; }
        [JsonProperty("username")]
        public string? Username { get; set; }
        [JsonProperty("credential")]
        public string? Credential { get; set; }
    }

    public class IceServerList
    {
        [JsonProperty("iceServers")]
        public List<IceServers> IceServers { get; set; } = new();
        [JsonProperty("iceTransportPolicy")]
        public string? IceTransportPolicy { get; set; }
    }
    public class IceServerListDto
    {
        public IceServerList Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.IceServerList);
    }

    public class Heartbeat
    {
        public string CheckString { get; set; } = "Ping";
    }
    public class HeartbeatDto
    {
        public Heartbeat Data { get; set; } = new();
        public string Type { get; } = "HeartBeat";
    }
    public class InitData
    {
        public string? Token { get; set; }
        public string? Id { get; set; }
    }

    public class InitDataDto
    {
        public InitData Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.InitData);
    }
    public class RandomUserId
    {
        public string? UserId { get; set; }
    }
    //public class RandomUserIdDto
    //{
    //    public RandomUserId Data { get; set; } = new();
    //    public string Type { get; } = "RandomUserId";
    //}
    public class Error
    {
        public string? Type { get; set; }
        public string? Message { get; set; }
    }
    public class ErrorDto
    {
        public Error Data { get; set; } = new();
        public string Type { get; } = nameof(MessageTypeDto.Error);
    }
    //public class SyncServerDto
    //{
    //    public object ForwardData { get; set; } = new();
    //    public string UserId { get; set; } = "";
    //    public string RemoteServer { get; set; } = "";
    //    public string Type { get; set; } = "SyncServer";
    //}
    //public class SocketClose
    //{
    //    public string Type { get; } = "SocketClose";
    //}
    //public class SocketCloseDto
    //{
    //    public SocketClose ForwardData { get; set; } = new();
    //    public string UserId { get; set; } = "";
    //    public string RemoteServer { get; set; } = "";
    //    public string Type { get; set; } = "SyncServer";
    //}

    public class SrsConnectionInfo
    {
        public string? SrsWhipUrl { get; set; }
        public string? SrsWhepUrl { get; set; }
        public string? Protocol { get; set; }
        public string? Ip { get; set; }
        public string? HttpServerPort { get; set; }
        public string? HttpApIPort { get; set; }
        public string? HttpApIPushRoute { get; set; } = "/rtc/v1/whip";
        public string? HttpApIPullRoute { get; set; } = "/rtc/v1/whep";
        public string? RTCCandidatePort { get; set; }
        public string? App { get; set; }
        public string? Stream { get; set; }
        public string? Token { get; set; }
    }

    public class SendUserToken
    {
        public string? UserToken { get; set; }
    }
}
