"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const labelMap: Record<string, string> = {
    present: "Present",
    absent: "Absent",
};

const CustomLegend = ({ payload }: any) => {
    if (!payload || !payload.length) return null;
    return (
        <div className="flex items-center gap-4 mb-3">
            {payload.map((entry: any) => (
                <div key={entry.dataKey || entry.value} className="flex items-center gap-2">
                    <span
                        style={{
                            background: entry.color,
                            width: 12,
                            height: 12,
                            borderRadius: 9999,
                            display: "inline-block",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                        }}
                    />
                    <span className="text-xs font-medium text-gray-500">
                        {labelMap[(entry.dataKey || entry.value) as string] || String(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

const TeacherAttendanceChart = ({
    data,
}: {
    data: { name: string; present: number; absent: number }[];
}) => {
    return (
        <ResponsiveContainer width="100%" height="90%">
            <BarChart width={500} height={300} data={data} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
                <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
                <Legend content={CustomLegend} />
                <Bar dataKey="present" fill="#10B981" legendType="circle" radius={[10, 10, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" legendType="circle" radius={[10, 10, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TeacherAttendanceChart;