namespace Server.Models
{
    public class ReceiveJoinRoom
    {
        public ReceiveJoinRoomData Data { get; set; } = new();
    }
    public class ReceiveJoinRoomData
    {
        public string? UserToken { get; set; }
        public string? MachineToken { get; set; }
        public string? RoomType;
        public string? RoomId { get; set; }
    }

    public class ReceiveOffer
    {
        public ReceiveOfferData Data { get; set; } = new();
    }
    public class Desc
    {
        public string? Sdp { get; set; }
        public string? Type { get; set; }
    }
    public class ReceiveOfferData
    {
        public string? RecvId { get; set; }
        public Desc Desc { get; set; } = new();
        public string? RoomId { get; set; }
    }

    public class ReceiveAnswer
    {
        public ReceiveAnswerData Data { get; set; } = new();
    }
    public class ReceiveAnswerData
    {
        public string? RecvId { get; set; }
        public Desc Desc { get; set; } = new();
        public string? RoomId { get; set; }
    }

    public class ReceiveCandidate
    {
        public ReceiveCandidateData Data { get; set; } = new();
    }
    public class ReceiveCandidateData
    {
        public string? RecvId { get; set; }
        public string? SdpMLineIndex { get; set; }
        public string? SdpMid { get; set; }
        public string? Candidate { get; set; }
        public string? RoomId { get; set; }
    }

    public class ReceiveGetIceServerlist
    {
        public ReceiveGetIceServerlistData Data { get; set; } = new();
    }
    public class ReceiveGetIceServerlistData
    {
        public string? RoomId { get; set; }
    }

    public class ReceiveBroadcastMessage
    {
        public ReceiveBroadcastMessageData Data { get; set; } = new();
    }
    public class ReceiveBroadcastMessageData
    {
        public string? RecvId { get; set; }
        public string? Message { get; set; }
        public string? RoomId { get; set; }
    }

    public class ReceiveMessage
    {
        public ReceiveMessageData Data { get; set; } = new();
    }
    public class ReceiveMessageData
    {
        public string? RecvId { get; set; }
        public string? Message { get; set; }
        public string? RoomId { get; set; }
    }
    public class ReceiveHeartbeat
    {
        public ReceiveHeartbeatData Data { get; set; } = new();
    }
    public class ReceiveHeartbeatData
    {
        public string? CheckString { get; set; }
    }

    public class ReceiveCreateRoom
    {
        public ReceiveCreateRoomData Data { get; set; } = new();
    }
    public class ReceiveCreateRoomData
    {
        public string? RoomType;
        public string? RoomId { get; set; }
    }

    public class ReceiveSRSCallbackData
    {
        public string? server_id { get; set; }
        public string? action { get; set; }
        public string? client_id { get; set; }
        public string? ip { get; set; }
        public string? vhost { get; set; }
        public string? app { get; set; }
        public string? tcUrl { get; set; }
        public string? stream { get; set; }
        public string? param { get; set; }
        public string? stream_url { get; set; }
        public string? stream_id { get; set; }
        public string? token { get; set; }
    }

    public class ReceiveGetUserTokenData
    {
        public string? Id { get; set; }

        public string? RoomId { get; set; }
        public string? UserKey { get; set; }
    }
    public class ReceiveRefreshSrsToken
    {
        public ReceiveRefreshSrsTokenData? Data { get; set; }
    }
    public class ReceiveRefreshSrsTokenData
    {
        public string? Token { get; set; }
    }
}
