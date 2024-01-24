namespace Server.Models
{
    public enum MessageTypeDto
    {
        JoinRoom = 0,
        CreateRoom = 1,
        HeartBeat = 2,
        Candidate = 3,
        SendCandidate = 4,
        SendMessage = 5,
        Message = 6,
        BroadcastMessage = 7,
        GetIceServerlist = 8,
        Answer = 9,
        Offer = 10,
        IceServerList = 11,
        InitData = 12,
        Error = 14,
        NewUser = 15,
        UserLeaveFromRoom = 16,
        UpdateRoom = 17,
        UpdateLobby = 18,
        SocketClose = 19,
    }
}
