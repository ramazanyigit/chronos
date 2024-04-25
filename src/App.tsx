import { useEffect, useRef, useState } from "react";

function App() {
  const [workingOn, setWorkingOn] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>();
  const [running, setRunning] = useState<boolean>(false);
  const beforeTotalRef = useRef(0);

  const startTimer = () => {
    setStartTime(new Date());
    setRunning(true);
    document.body.requestFullscreen().catch((err) => {
      console.error(`${err.name}, ${err.message}`);
    });
  };

  const pauseTimer = () => {
    setRunning(false);
    beforeTotalRef.current =
      beforeTotalRef.current + new Date().getTime() - startTime!.getTime();
    document.exitFullscreen().catch((err) => {
      console.error(`${err.name}, ${err.message}`);
    });
  };

  const stopTimer = () => {
    setStartTime(undefined);
    setRunning(false);
    beforeTotalRef.current = 0;
    const timerValueElement = document.getElementById("timer-value");
    if (timerValueElement) {
      timerValueElement.innerText = "00:00:00.000";
    }

    document.exitFullscreen().catch((err) => {
      console.error(`${err.name}, ${err.message}`);
    });
  };

  useEffect(() => {
    if (!running || !startTime) {
      return;
    }

    let wakeLock: WakeLockSentinel | undefined = undefined;

    navigator.wakeLock.request("screen").then((_wakeLock) => {
      wakeLock = _wakeLock;
    }
    ).catch((err) => {
      console.error(`${err.name}, ${err.message}`);
    });

    const interval = setInterval(() => {
      const now = new Date();
      const diff =
        beforeTotalRef.current + (now.getTime() - startTime.getTime());
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      const milliseconds = diff % 1000;

      const hoursStr = hours.toString().padStart(2, "0");
      const minutesStr = minutes.toString().padStart(2, "0");
      const secondsStr = seconds.toString().padStart(2, "0");
      const millisecondsStr = milliseconds.toString().padStart(3, "0");

      const timerValue = `${hoursStr}:${minutesStr}:${secondsStr}.${millisecondsStr}`;
      const timerValueElement = document.getElementById("timer-value");
      if (timerValueElement) {
        timerValueElement.innerText = timerValue;
      }
    }, 1000 / 60);

    return () => {
      clearInterval(interval);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [startTime, running]);

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="w-100 h-full mx-auto flex flex-col items-center justify-around">
        <div className="grid grid-cols-2">
          <input
            spellCheck="false"
            className="text-[4vw] font-bold text-center bg-transparent border-b-4 border-b-slate-700 text-slate-100 placeholder:text-slate-600 mx-8 pb-8 mt-8 focus:outline-none"
            placeholder="I'm working on..."
            value={workingOn}
            onChange={(e) => setWorkingOn(e.target.value)}
          />

          <div className="grid grid-cols-2">
            <button
              className="text-[4vw] font-bold text-center bg-transparent text-slate-300 hover:text-slate-50 px-16 ml-16 focus:outline-none"
              onClick={() => {
                if (running) {
                  pauseTimer();
                } else {
                  startTimer();
                }
              }}
            >
              {running ? "Pause" : startTime ? "Continue" : "Start"}
            </button>
            <button
              className="text-[4vw] font-bold text-center bg-transparent text-slate-300 hover:text-slate-50 disabled:text-slate-600 px-16 ml-8 focus:outline-none"
              onClick={stopTimer}
              disabled={!startTime}
            >
              Stop
            </button>
          </div>
        </div>
        <span className="text-slate-100 text-[12vw] font-mono" id="timer-value">
          00:00:00.000
        </span>
        <div className="text-slate-400 uppercase font-semibold text-[.8vw]">The Chronos written by devkurabiye at 25 April, 2024.</div>
      </div>
    </div>
  );
}

export default App;
