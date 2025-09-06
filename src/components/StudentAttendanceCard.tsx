import { prisma } from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
    const attendance = await prisma.attendance.findMany({
        where: {
            studentId: id,
            date: {
                gte: new Date(new Date().getFullYear(), 0, 1),
            },
        },
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter((day) => day.status === "PRESENT").length;
    const compensationDays = attendance.filter((day) => day.status === "COMPENSATION").length;
    const absentDays = attendance.filter((day) => day.status === "ABSENT").length;
    
    // Calculate effective attendance (Present + Compensation)
    const effectiveAttendance = presentDays + compensationDays;
    const percentage =
        totalDays === 0 ? "-" : ((effectiveAttendance / totalDays) * 100).toFixed(1);

    return (
        <div className="">
            <h1 className="text-xl font-semibold">
                {percentage}%
            </h1>
            <span className="text-sm text-gray-400">Attendance</span>
            {totalDays > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                    {presentDays}P + {compensationDays}C / {totalDays}
                </div>
            )}
        </div>
    );
};

export default StudentAttendanceCard;
