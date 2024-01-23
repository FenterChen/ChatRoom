using Serilog.Core;
using Serilog.Events;

namespace Server.Util
{
    public class TaipeiTime : ILogEventEnricher
    {
        public static string GetTaipeiTime()
        {
            TimeZoneInfo taipeiTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time");
            DateTime utcNow = DateTime.UtcNow;
            DateTime taipeiTime = TimeZoneInfo.ConvertTimeFromUtc(utcNow, taipeiTimeZone);
            return taipeiTime.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            logEvent.AddPropertyIfAbsent(new LogEventProperty("TaipeiTimestamp", new ScalarValue(GetTaipeiTime())));
        }
    }
}
