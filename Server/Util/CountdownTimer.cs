using System.Timers;

namespace SignalingServer.Util
{
    public class CountdownTimer
    {
        private static System.Timers.Timer? _timer;
        public event Action? TimerEvent;
        private static System.Timers.Timer? _expiredtimer;
        public event Action? ExpiredTimerEvent;
        private readonly int _millisecond;

        public enum TimerFunctionEnum
        {
            SocketHeartBeat = 0,
        }
        public CountdownTimer(TimerFunctionEnum timerFunctionEnum)
        {
            switch (timerFunctionEnum)
            {
                case TimerFunctionEnum.SocketHeartBeat:
                    _millisecond = 10 * 1000;
                    _timer = new(_millisecond)
                    {
                        AutoReset = false
                    };
                    _timer.Elapsed += OnTimedEvent;
                    _expiredtimer = new(_millisecond)
                    {
                        AutoReset = false
                    };
                    _expiredtimer.Elapsed += OnExpiredTimedEvent;
                    break;
            };
        }

        public void Start()
        {
            _timer?.Stop();
            _timer?.Start();
            _expiredtimer?.Stop();
        }
        public void Remove()
        {
            _timer?.Stop();
            _expiredtimer?.Stop();
            _timer?.Dispose();
            _expiredtimer?.Dispose();
        }

        private void OnTimedEvent(object? source, ElapsedEventArgs e)
        {
            TimerEvent?.Invoke();
            _expiredtimer?.Start();
        }
        private void OnExpiredTimedEvent(object? source, ElapsedEventArgs e)
        {
            ExpiredTimerEvent?.Invoke();
        }
    }
}
