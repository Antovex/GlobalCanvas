import Image from "next/image";
import CountChart from "./CountChart";
import { prisma } from "@/lib/prisma";

const CountChartContainer = async () => {
    const data = await prisma.student.groupBy({
        by: ["sex"],
        _count: true,
    });

    const boys = data.find((item) => item.sex === "MALE")?._count ?? 0;
    const girls = data.find((item) => item.sex === "FEMALE")?._count ?? 0;

    return (
        <div className="bg-white rounded-xl w-full h-full p-4 ">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Students</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} />
            </div>
            {/* CHART */}
            <CountChart boys={boys} girls={girls} />
            {/* BOTTOM */}
            <div className="flex justify-center gap-16">
                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="w-5 h-5 bg-Sky rounded-full" />
                    <h1 className="font-bold text-center">{boys}</h1>
                    <h2 className="text-xs text-center text-gray-300">
                        Boys (
                        {boys + girls === 0
                            ? 0
                            : Math.round((boys / (boys + girls)) * 100)}
                        %)
                    </h2>
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                    <div className="w-5 h-5 bg-Yellow rounded-full" />
                    <h1 className="font-bold text-center">{girls}</h1>
                    <h2 className="text-xs text-center text-gray-300">
                        Girls (
                        {boys + girls === 0
                            ? 0
                            : Math.round((girls / (boys + girls)) * 100)}
                        %)
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default CountChartContainer;
