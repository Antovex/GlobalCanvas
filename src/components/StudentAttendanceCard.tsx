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

    // TODO: Change this logic when changing schema for AttendanceStatus
    const totalDays = attendance.length;
    const absentDays = attendance.filter((day) => !(day.present)).length;
    const percentage =
        totalDays === 0 ? "-" : (((totalDays - absentDays) / totalDays) * 100).toFixed(2);

    return (
        <div className="">
            <h1 className="text-xl font-semibold">
                {percentage || "-"}
            </h1>
            <span className="text-sm text-gray-400">Attendance</span>
        </div>
    );
};

export default StudentAttendanceCard;
