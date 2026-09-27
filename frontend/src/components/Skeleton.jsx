import React from 'react';

export const CardSkeleton = () => (
  <div className="noc-card p-4 animate-pulse space-y-3">
    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
    <div className="h-8 bg-slate-800 rounded w-3/4"></div>
    <div className="h-3 bg-slate-800 rounded w-1/3"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="noc-card p-4 animate-pulse space-y-3">
    <div className="h-6 bg-slate-800 rounded w-full mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-8 bg-slate-800/60 rounded w-full"></div>
    ))}
  </div>
);
