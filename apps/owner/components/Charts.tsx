"use client";

import { cn } from "@/lib/utils";

// --- Line Chart ---
export function LineChart({
  data,
  height = 200,
  color = "#F2542D",
  fillOpacity = 0.15,
  yFormat = (n: number) => n.toLocaleString(),
  xLabel = (d: number) => String(d),
  showGrid = true,
}: {
  data: { x: number; y: number }[];
  height?: number;
  color?: string;
  fillOpacity?: number;
  yFormat?: (n: number) => string;
  xLabel?: (x: number) => string;
  showGrid?: boolean;
}) {
  if (data.length === 0) return null;
  const w = 800;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 28, left: 56 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const ys = data.map((d) => d.y);
  const xs = data.map((d) => d.x);
  const yMin = 0;
  const yMax = Math.max(...ys) * 1.1 || 1;
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const xScale = (x: number) =>
    pad.left + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const yScale = (y: number) =>
    pad.top + innerH - ((y - yMin) / (yMax - yMin || 1)) * innerH;

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(d.x)} ${yScale(d.y)}`)
    .join(" ");
  const areaPath =
    path +
    ` L ${xScale(data[data.length - 1].x)} ${pad.top + innerH} L ${xScale(data[0].x)} ${pad.top + innerH} Z`;

  // Y ticks (4)
  const yTicks = 4;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((yMax / yTicks) * i),
  );

  // X ticks (~6)
  const xTickStep = Math.max(1, Math.ceil(data.length / 7));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
    >
      {/* Grid */}
      {showGrid &&
        yTickVals.map((v, i) => (
          <line
            key={i}
            x1={pad.left}
            x2={w - pad.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="#EBE0C8"
            strokeWidth={1}
            strokeDasharray={i === 0 ? "0" : "2 4"}
          />
        ))}

      {/* Y labels */}
      {yTickVals.map((v, i) => (
        <text
          key={i}
          x={pad.left - 8}
          y={yScale(v)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="11"
          fill="#A39884"
        >
          {yFormat(v)}
        </text>
      ))}

      {/* X labels */}
      {data.map((d, i) =>
        i % xTickStep === 0 || i === data.length - 1 ? (
          <text
            key={d.x}
            x={xScale(d.x)}
            y={h - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#A39884"
          >
            {xLabel(d.x)}
          </text>
        ) : null,
      )}

      {/* Area fill */}
      <defs>
        <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lcg)" />

      {/* Line */}
      <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {data.map((d) => (
        <circle key={d.x} cx={xScale(d.x)} cy={yScale(d.y)} r="3" fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

// --- Bar Chart ---
export function BarChart({
  data,
  height = 200,
  color = "#F2542D",
  yFormat = (n: number) => n.toLocaleString(),
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  yFormat?: (n: number) => string;
}) {
  if (data.length === 0) return null;
  const w = 800;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 40, left: 56 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const barW = (innerW / data.length) * 0.65;
  const step = innerW / data.length;
  const yScale = (v: number) => pad.top + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line
          key={p}
          x1={pad.left}
          x2={w - pad.right}
          y1={pad.top + innerH * (1 - p)}
          y2={pad.top + innerH * (1 - p)}
          stroke="#EBE0C8"
          strokeWidth={1}
          strokeDasharray={p === 0 ? "0" : "2 4"}
        />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <text
          key={p}
          x={pad.left - 8}
          y={pad.top + innerH * (1 - p)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="11"
          fill="#A39884"
        >
          {yFormat(Math.round(max * p))}
        </text>
      ))}

      {data.map((d, i) => {
        const x = pad.left + step * i + (step - barW) / 2;
        const y = yScale(d.value);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={pad.top + innerH - y}
              rx={4}
              fill={color}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={h - 22}
              textAnchor="middle"
              fontSize="10"
              fill="#7A7060"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// --- Horizontal Bar (for top menus) ---
export function HorizontalBars({
  data,
  color = "#F2542D",
}: {
  data: { label: string; value: number; sub?: string }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i}>
            <div className="mb-1 flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cream-200 text-[10px] font-bold text-ink-700 tabular">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-ink-800">{d.label}</span>
                {d.sub && <span className="text-xs text-ink-400">{d.sub}</span>}
              </div>
              <span className="text-sm font-bold tabular text-ink-800">
                {d.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-cream-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Hourly Heatmap ---
export function HourlyHeatmap({
  data,
}: {
  data: { hour: number; revenue: number }[];
}) {
  const max = Math.max(...data.map((d) => d.revenue)) || 1;
  return (
    <div className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
      {data.map((d) => {
        const intensity = d.revenue / max;
        const opacity = 0.15 + intensity * 0.85;
        return (
          <div key={d.hour} className="flex flex-col items-center gap-1">
            <div
              className="aspect-square w-full rounded"
              title={`${d.hour}:00 — ฿${d.revenue.toLocaleString()}`}
              style={{
                background: `rgba(242, 84, 45, ${opacity})`,
              }}
            />
            <div
              className={cn(
                "text-[8px] tabular",
                d.hour % 3 === 0 ? "text-ink-500" : "text-transparent",
              )}
            >
              {d.hour}
            </div>
          </div>
        );
      })}
    </div>
  );
}
