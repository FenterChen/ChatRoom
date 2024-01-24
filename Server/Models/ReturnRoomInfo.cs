namespace Server.Models
{
    public enum GenerateFormattedRoomInfoType
    {
        NewUser = 0,
        UpdateLobby = 1,
        UpdateRoom = 2,
        UserLeaveFromRoom = 3,
        UserLeaveFromLobby = 4,
    }
    public class ReturnRoomInfo
    {
        //Used to return room information
        public object UserDto { get; set; } = "";
        public string Room { get; set; } = "";
    }
}
