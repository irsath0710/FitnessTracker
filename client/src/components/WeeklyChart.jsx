import React, { useState, useMemo } from 'react';

/**
 * Custom SVG Line Chart for Weekly Activity Analysis
 * - Smooth bezier curves
 * - Gradient fills under lines
 * - Interactive hover with tooltip
 * - Animated dots
 */
export default function WeeklyChart({ data = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Chart dimensions
    const width = 600;
    const height = 240;
    const padding = { top: 20, right: 20, bottom: 32, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Compute scales
    const { maxVal, yTicks, points } = useMemo(() => {
        const allVals = data.flatMap(d => [d.intake, d.burned]);
        let max = Math.max(...allVals, 100);
        max = Math.ceil(max / 100) * 100 || 500;

        const ticks = [];
        const tickCount = 4;
        for (let i = 0; i <= tickCount; i++) {
            ticks.push(Math.round((max / tickCount) * i));
        }

        const pts = data.map((d, i) => {
            const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
            return {
                x,
                intakeY: padding.top + chartH - (d.intake / max) * chartH,
                burnedY: padding.top + chartH - (d.burned / max) * chartH,
                ...d,
            };
        });

        return { maxVal: max, yTicks: ticks, points: pts };
    }, [data, chartW, chartH]);

    // Build smooth bezier path
    const buildPath = (pts, key) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0][key]}`;
        let d = `M ${pts[0].x} ${pts[0][key]}`;
        for (let i = 1; i < pts.length; i++) {
            const prev = pts[i - 1];
            const curr = pts[i];
            const cpx = (prev.x + curr.x) / 2;
            d += ` C ${cpx} ${prev[key]}, ${cpx} ${curr[key]}, ${curr.x} ${curr[key]}`;
        }
        return d;
    };

    // Build closed area path for gradient fill
    const buildArea = (pts, key) => {
        if (pts.length === 0) return '';
        const bottom = padding.top + chartH;
        let d = buildPath(pts, key);
        d += ` L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
        return d;
    };

    const intakePath = buildPath(points, 'intakeY');
    const burnedPath = buildPath(points, 'burnedY');
    const intakeArea = buildArea(points, 'intakeY');
    const burnedArea = buildArea(points, 'burnedY');

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-3 px-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_#22c55e80]" />
                    Calories Intake
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-[0_0_6px_#f9731680]" />
                    Calories Burned
                </div>
            </div>

            <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full"
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        {/* Intake gradient */}
                        <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                        </linearGradient>
                        {/* Burned gradient */}
                        <linearGradient id="burnedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                        </linearGradient>
                        {/* Glow filters */}
                        <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="glowOrange" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Horizontal grid lines */}
                    {yTicks.map((tick, i) => {
                        const y = padding.top + chartH - (tick / maxVal) * chartH;
                        return (
                            <g key={i}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={padding.left + chartW}
                                    y2={y}
                                    stroke="#ffffff08"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding.left - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    fill="#525252"
                                    fontSize="10"
                                    fontFamily="monospace"
                                >
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    {/* X axis labels */}
                    {points.map((p, i) => (
                        <text
                            key={i}
                            x={p.x}
                            y={height - 6}
                            textAnchor="middle"
                            fill="#525252"
                            fontSize="11"
                            fontWeight={hoveredIndex === i ? '600' : '400'}
                            className="transition-all"
                        >
                            {p.day}
                        </text>
                    ))}

                    {/* Area fills */}
                    <path d={intakeArea} fill="url(#intakeGrad)" />
                    <path d={burnedArea} fill="url(#burnedGrad)" />

                    {/* Lines */}
                    <path
                        d={intakePath}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowGreen)"
                    />
                    <path
                        d={burnedPath}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glowOrange)"
                    />

                    {/* Hover columns (invisible hit areas) */}
                    {points.map((p, i) => {
                        const colW = chartW / data.length;
                        return (
                            <rect
                                key={i}
                                x={p.x - colW / 2}
                                y={padding.top}
                                width={colW}
                                height={chartH}
                                fill="transparent"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onTouchStart={() => setHoveredIndex(i)}
                            />
                        );
                    })}

                    {/* Hover vertical line */}
                    {hoveredIndex !== null && points[hoveredIndex] && (
                        <line
                            x1={points[hoveredIndex].x}
                            y1={padding.top}
                            x2={points[hoveredIndex].x}
                            y2={padding.top + chartH}
                            stroke="#ffffff15"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                        />
                    )}

                    {/* Data dots */}
                    {points.map((p, i) => (
                        <g key={i}>
                            {/* Intake dot */}
                            <circle
                                cx={p.x}
                                cy={p.intakeY}
                                r={hoveredIndex === i ? 6 : 4}
                                fill="#050505"
                                stroke="#22c55e"
                                strokeWidth="2.5"
                                className="transition-all duration-200"
                            />
                            {hoveredIndex === i && p.intake > 0 && (
                                <circle
                                    cx={p.x}
                                    cy={p.intakeY}
                                    r="10"
                                    fill="#22c55e"
                                    opacity="0.15"
                                />
                            )}

                            {/* Burned dot */}
                            <circle
                                cx={p.x}
                                cy={p.burnedY}
                                r={hoveredIndex === i ? 6 : 4}
                                fill="#050505"
                                stroke="#f97316"
                                strokeWidth="2.5"
                                className="transition-all duration-200"
                            />
                            {hoveredIndex === i && p.burned > 0 && (
                                <circle
                                    cx={p.x}
                                    cy={p.burnedY}
                                    r="10"
                                    fill="#f97316"
                                    opacity="0.15"
                                />
                            )}
                        </g>
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                    <div
                        className="absolute pointer-events-none z-10 bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-md rounded-xl px-3.5 py-2.5 shadow-2xl"
                        style={{
                            left: `${(points[hoveredIndex].x / width) * 100}%`,
                            top: `${(Math.min(points[hoveredIndex].intakeY, points[hoveredIndex].burnedY) / height) * 100 - 8}%`,
                            transform: `translate(${points[hoveredIndex].x > width / 2 ? '-100%' : '0%'}, -100%)`,
                        }}
                    >
                        <div className="text-[11px] font-semibold text-zinc-300 mb-1.5 border-b border-zinc-700 pb-1">
                            {points[hoveredIndex].day}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-zinc-400">Intake:</span>
                            <span className="font-bold text-emerald-400 ml-auto">{points[hoveredIndex].intake} kcal</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-zinc-400">Burned:</span>
                            <span className="font-bold text-orange-400 ml-auto">{points[hoveredIndex].burned} kcal</span>
                        </div>
                        {points[hoveredIndex].workouts > 0 && (
                            <div className="text-[10px] text-zinc-500 mt-1 pt-1 border-t border-zinc-700/50">
                                {points[hoveredIndex].workouts} workout{points[hoveredIndex].workouts > 1 ? 's' : ''} · {points[hoveredIndex].duration} min
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
