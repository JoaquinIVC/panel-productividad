"use client";

import { useActivityLog } from "@/hooks/useActivityLog";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function ActivityChart() {
  const { getDailyActivityCounts } = useActivityLog();
  const data = getDailyActivityCounts();

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">
        Actividad últimos 7 días
      </h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5c7cfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5c7cfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#868e96" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#868e96" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(22,27,34,0.95)",
                border: "1px solid rgba(48,54,61,0.5)",
                borderRadius: "12px",
                color: "#e6edfe",
                fontSize: "13px",
              }}
              formatter={(value: number) => [`${value} acciones`, "Actividad"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#5c7cfa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
