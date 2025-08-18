"use client";

import Image from "next/image";
// import React, { PureComponent } from "react";
import {
    RadialBarChart,
    RadialBar,
    Legend,
    ResponsiveContainer,
} from "recharts";


const style = {
    top: "50%",
    right: 0,
    transform: "translate(0, -50%)",
    lineHeight: "24px",
};

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
    const data = [
        {
            name: "Total Students",
            count: boys + girls,
            fill: "white",
        },
        {
            name: "Boys",
            count: boys,
            fill: "#C3EBFA",
        },
        {
            name: "Girls",
            count: girls,
            fill: "#FAE27C",
        },
    ];

    return (
        <div className="relative w-fill h-[75%]">
            <ResponsiveContainer>
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="100%"
                    barSize={32}
                    data={data}
                >
                    <RadialBar
                        // label={{ position: "insideStart", fill: "#fff" }}
                        background
                        dataKey="count"
                    />
                </RadialBarChart>
            </ResponsiveContainer>
            <Image
                src="/maleFemale.png"
                alt=""
                width={50}
                height={50}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
        </div>
    );
};

export default CountChart;
