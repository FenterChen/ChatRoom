using Microsoft.AspNetCore.Http;
using Server.Services;

namespace Server.Models
{
    public class User
    {
        public string? Id { get; private set; }

        public string? AvailableRoomId { get; private set; }
        public BaseRoom? Room; // 所在房間
        private WebsocketManager? websocketManager;

        public bool IsOnline { get => websocketManager?.IsOnline ?? false; }

        public User()
        {
            Id = SerialNumberWithTimeAndGuid();
        }

        public static string SerialNumberWithTimeAndGuid()
        {
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
            string guidPart = Guid.NewGuid().ToString("N")[..8].ToUpper();
            return timestamp + "-" + guidPart;
        }

        public void SetWebsocketManager(WebsocketManager websocketManager)
        {
            this.websocketManager = websocketManager;
        }

        public void Send(string type, int error, object data)
        {
            websocketManager?.Send(type, error, data);
        }

        public void Send(object DataDto)
        {
            websocketManager?.Send(DataDto);
        }

        public async Task Close()
        {
            if (websocketManager != null)
            {
                await websocketManager.Close();
            }
        }
    }
}
