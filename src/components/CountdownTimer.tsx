import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

// Dígito que desliza com blur só quando o valor muda (inspirado no "Animate Digits" do 21st.dev)
function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block w-[0.62em] overflow-hidden text-center">
      <span key={value} className="inline-block animate-in fade-in slide-in-from-top-3 duration-300">
        {value}
      </span>
    </span>
  );
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const calculate = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      ended: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculate);

  useEffect(() => {
    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (timeLeft.ended) {
    return (
      <div className="rounded-full bg-urgency/10 px-6 py-3 font-body font-semibold text-urgency">
        Evento encerrado
      </div>
    );
  }

  const units = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ];
  const urgent = timeLeft.days === 0;

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-4" role="timer" aria-live="off">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-start gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`glass flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl font-display text-3xl sm:text-4xl font-bold tabular-nums shadow-elevated ${
                urgent ? 'text-urgency' : 'text-foreground'
              }`}
            >
              {String(unit.value)
                .padStart(2, '0')
                .split('')
                .map((d, idx) => (
                  <Digit key={idx} value={d} />
                ))}
            </div>
            <span className="mt-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="mt-4 sm:mt-6 font-display text-2xl text-secondary animate-pulse-slow">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
