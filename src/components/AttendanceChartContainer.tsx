import { prisma } from "@/lib/prisma";
import Image from "next/image";
import AttendanceChart from "./AttendanceChart";

const AttendanceChartContainer = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daySinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daySinceMonday);
    const nextSunday = new Date(today);
    nextSunday.setDate(lastMonday.getDate() + 7);

    const resData = await prisma.attendance.findMany({
        where: {
            date: {
                gte: lastMonday,
                lte: nextSunday,
            },
        },
        select: {
            date: true,
            status: true,
        },
    });

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const attendanceMap: {
        [key: string]: { present: number; absent: number; compensation: number };
    } = {
        Mon: { present: 0, absent: 0, compensation: 0 },
        Tue: { present: 0, absent: 0, compensation: 0 },
        Wed: { present: 0, absent: 0, compensation: 0 },
        Thu: { present: 0, absent: 0, compensation: 0 },
        Fri: { present: 0, absent: 0, compensation: 0 },
        Sat: { present: 0, absent: 0, compensation: 0 },
        Sun: { present: 0, absent: 0, compensation: 0 },
    };

    resData.forEach((item) => {
        const itemDate = new Date(item.date);
        const dayOfWeek = itemDate.getDay();
        const dayName = daysOfWeek[dayOfWeek === 0 ? 6 : dayOfWeek - 1]; // Map 0 to 'Sun', 6 to 'Sat'

        switch (item.status) {
            case "PRESENT":
                attendanceMap[dayName].present += 1;
                break;
            case "ABSENT":
                attendanceMap[dayName].absent += 1;
                break;
            case "COMPENSATION":
                attendanceMap[dayName].compensation += 1;
                break;
        }
    });

    // For chart, we can combine present + compensation as "effective attendance"
    const data = daysOfWeek.map((day) => ({
        name: day,
        present: attendanceMap[day].present + attendanceMap[day].compensation, // Effective attendance
        absent: attendanceMap[day].absent,
    }));

    return (
        <div className="bg-white rounded-lg p-4 h-full">
            {/* TITLE */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">Attendance</h1>
                <Image
                    src="/moreDark.png"
                    alt=""
                    width={20}
                    height={20}
                />
            </div>

            {/* Attendance Chart */}
            <AttendanceChart data={data} />
        </div>
    );
};

export default AttendanceChartContainer;
