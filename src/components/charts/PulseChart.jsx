import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 border border-white/10 p-4 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-slate-400 text-xs mb-1">Episode {data.episode_number}</p>
                <p className="font-bold text-white mb-2 max-w-[200px] leading-tight">{data.name}</p>
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${data.vote_average >= 8 ? 'text-green-400' :
                            data.vote_average < 6 ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                        {data.vote_average.toFixed(1)}
                    </span>
                    <span className="text-slate-500 text-xs">/ 10</span>
                </div>
            </div>
        );
    }
    return null;
};

const PulseChart = ({ data }) => {
    // Calculate gradient offsets based on data range if needed, or just use simple gradient

    return (
        <div className="h-[400px] w-full bg-slate-900/30 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
            <h3 className="text-slate-400 text-sm font-semibold mb-4 ml-2">Rating Pulse</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                            {/* Simple gradient for the line, could be dynamic */}
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="episode_number"
                        stroke="#475569"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickMargin={10}
                    />
                    <YAxis
                        domain={[0, 10]}
                        hide={false}
                        stroke="#475569"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        ticks={[0, 2, 4, 6, 8, 10]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                    <Line
                        type="monotone"
                        dataKey="vote_average"
                        stroke="url(#lineColor)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#1e293b', stroke: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PulseChart;
