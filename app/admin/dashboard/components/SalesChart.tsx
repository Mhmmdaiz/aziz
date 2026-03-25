"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SalesChartProps {
  data: {
    date: string;
    total: number;
  }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const gridColor = isDark ? "#27272a" : "#e5e7eb";
  const tickColor = isDark ? "#71717a" : "#9ca3af";
  const tooltipBg = isDark ? "#09090b" : "#ffffff";
  const tooltipBorder = isDark ? "#27272a" : "#e5e7eb";
  const tooltipLabelColor = isDark ? "#00FF85" : "#059669";
  const tooltipItemColor = isDark ? "#fff" : "#111";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm dark:shadow-none h-full min-h-[400px]"
    >
      <header className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
            Arus Pendapatan Harian
          </h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-1">
            Data_Stream // 07_Days_Window
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-zinc-900 dark:bg-white border border-zinc-300 dark:border-zinc-700" />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
            Revenue
          </span>
        </div>
      </header>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={gridColor}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: tickColor }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: tickColor }}
              tickFormatter={(value) => `Rp${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: "12px",
                padding: "12px",
              }}
              labelStyle={{
                color: tooltipLabelColor,
                fontWeight: 900,
                fontSize: "10px",
                marginBottom: "4px",
              }}
              itemStyle={{
                color: tooltipItemColor,
                fontWeight: 900,
                fontSize: "12px",
                fontStyle: "italic",
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={4}
              dot={{
                r: 4,
                fill: "#2563eb",
                stroke: isDark ? "#09090b" : "#fff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 8,
                fill: "#2563eb",
                stroke: isDark ? "#09090b" : "#fff",
                strokeWidth: 4,
              }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
