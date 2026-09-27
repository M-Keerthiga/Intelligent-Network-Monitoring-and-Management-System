import React from 'react';

const HealthGauge = ({ score = 100, size = 120, strokeWidth = 10 }) => {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let color = '#10b981'; // green
  let statusText = 'EXCELLENT';
  
  if (normalizedScore < 50) {
    color = '#ef4444'; // red
    statusText = 'CRITICAL';
  } else if (normalizedScore < 75) {
    color = '#f59e0b'; // amber
    statusText = 'WARNING';
  } else if (normalizedScore < 90) {
    color = '#3b82f6'; // blue
    statusText = 'GOOD';
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1f2937"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black tracking-tight" style={{ color }}>
          {normalizedScore}
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          {statusText}
        </span>
      </div>
    </div>
  );
};

export default HealthGauge;
