"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getFeesChartData } from "@/lib/actions";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

type ChartPoint = { name: string; fees: number };

const FinanceChart = () => {
    const [data, setData] = useState<ChartPoint[] | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getFeesChartData();
                if (mounted) setData(res);
            } catch {
                // fallback empty data if needed
                if (mounted) {
                    setData([
                        { name: "Jan", fees: 0 },
                        { name: "Feb", fees: 0 },
                        { name: "Mar", fees: 0 },
                        { name: "Apr", fees: 0 },
                        { name: "May", fees: 0 },
                        { name: "Jun", fees: 0 },
                        { name: "Jul", fees: 0 },
                        { name: "Aug", fees: 0 },
                        { name: "Sep", fees: 0 },
                        { name: "Oct", fees: 0 },
                        { name: "Nov", fees: 0 },
                        { name: "Dec", fees: 0 },
                    ]);
                }
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="bg-white rounded-lg p-4 h-full">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Finance</h1>
                <Image
                    src="/moreDark.png"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                />
            </div>

            {/* CHART */}
            <div className="h-[90%]">
                {data === null ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        Loading latest fees...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            width={500}
                            height={300}
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tick={{ fill: "#d1d5db" }}
                                tickLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                axisLine={false}
                                tick={{ fill: "#d1d5db" }}
                                tickLine={false}
                                tickMargin={20}
                            />
                            <Tooltip />
                            <Legend
                                align="center"
                                verticalAlign="top"
                                wrapperStyle={{
                                    fontWeight: "500",
                                    paddingTop: "10px",
                                    paddingBottom: "30px",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="fees"
                                stroke="#C3EBFA"
                                strokeWidth={5}
                                name="Student Fees"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default FinanceChart;