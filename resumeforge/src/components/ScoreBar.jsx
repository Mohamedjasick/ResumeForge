import { useEffect, useState } from 'react';

export default function ScoreBar({ score }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const getColor = (s) => {
    if (s >= 80) return { bar: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', label: 'Excellent' };
    if (s >= 60) return { bar: 'from-forge-600 to-forge-400', text: 'text-forge-400', label: 'Good' };
    if (s >= 40) return { bar: 'from-amber-600 to-amber-400', text: 'text-amber-400', label: 'Fair' };
    return { bar: 'from-red-600 to-red-400', text: 'text-red-400', label: 'Needs Work' };
  };

  const { bar, text, label } = getColor(score);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-display font-medium text-ink-400">ATS Score</span>
        <div className="flex items-center gap-2">
          <span className={`text-3xl font-display font-bold ${text}`}>{score}</span>
          <div>
            <span className="text-ink-500 text-sm">/100</span>
            <p className={`text-xs font-display font-medium ${text}`}>{label}</p>
          </div>
        </div>
      </div>

      <div className="relative h-3 bg-ink-800 rounded-full overflow-hidden">
        {/* Background grid lines */}
        {[25, 50, 75].map((mark) => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-px bg-ink-700/50"
            style={{ left: `${mark}%` }}
          />
        ))}
        {/* Filled bar */}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-1000 ease-out relative`}
          style={{ width: animated ? `${score}%` : '0%' }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full opacity-50 blur-sm bg-inherit" />
        </div>
      </div>

      {/* Markers */}
      <div className="flex justify-between text-xs text-ink-600 font-mono px-0.5">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>
  );
}
