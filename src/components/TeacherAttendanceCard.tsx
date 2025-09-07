import { prisma } from "@/lib/prisma";

const TeacherAttendanceCard = async ({ teacherId }: { teacherId?: string }) => {
    let attendance: { id: number; teacherId: string; date: Date; present: boolean; }[] = [];
    
    try {
        const where: any = {
            date: {
                gte: new Date(new Date().getFullYear(), 0, 1), // From January 1st
            },
        };

        if (teacherId) {
            where.teacherId = teacherId;
        }

        attendance = await prisma.teacherAttendance.findMany({
            where,
        });
    } catch (error) {
        console.error("Error fetching teacher attendance:", error);
    }

    const totalDays = attendance.length;
    const presentDays = attendance.filter((day) => day.present).length;
    const absentDays = totalDays - presentDays;
    
    const percentage =
        totalDays === 0 ? "-" : ((presentDays / totalDays) * 100).toFixed(1);

    return (
        <div className="">
            <h1 className="text-xl font-semibold">
                {percentage}%
            </h1>
            <span className="text-sm text-gray-400">Attendance</span>
            {totalDays > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                    {presentDays}P / {totalDays} days
                </div>
            )}
        </div>
    );
};

export default TeacherAttendanceCard;