import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="border-2 border-border bg-card text-foreground font-display text-3xl md:text-4xl font-bold rounded-xl w-18 md:w-22 h-18 md:h-22 flex items-center justify-center shadow-soft" style={{ width: '4.5rem', height: '4.5rem' }}>
            {String(unit.value).padStart(2, '0')}
          </div>
          <span className="text-[10px] mt-2 text-muted-foreground font-body uppercase tracking-[0.15em] font-semibold">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
