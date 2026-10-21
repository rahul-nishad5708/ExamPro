import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function ScoreChart({ data = [], title = 'Score Analysis' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No assessment data available to visualize
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-xl glass-panel border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-white">{label}</p>
          <p className="text-indigo-400 font-semibold">
            Score: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-xs text-slate-400">Score (%)</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.score >= 50
                      ? '#6366f1' // indigo
                      : '#f43f5e' // rose
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
