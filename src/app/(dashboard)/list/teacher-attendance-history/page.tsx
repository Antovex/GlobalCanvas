import { prisma } from "@/lib/prisma";
import { getUserRole, getCurrentUserId } from "@/lib/util";
import { redirect } from "next/navigation";
import TeacherAttendanceFilter from "@/components/TeacherAttendanceFilter";
import TeacherAttendanceCard from "@/components/TeacherAttendanceCard";
import TeacherAttendanceChart from "@/components/TeacherAttendanceChart";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";

const TeacherAttendanceHistoryPage = async ({ searchParams }: any) => {
    const role = await getUserRole();
    const userId = await getCurrentUserId();

    // Only admins and teachers can access
    if (role !== "admin" && role !== "teacher") {
        redirect("/unauthorized");
    }

    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }

    const { page = "1", teacherId, from, to, ...queryParams } = normalized;
    const p = parseInt(page);

    // Teachers can only view their own data
    const targetTeacherId = role === "teacher" ? userId : teacherId;

    let data: any[] = [];
    let count = 0;
    let teachers: any[] = [];
    let statistics = { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0 };

    try {
        // Fetch teachers for admin filter
        if (role === "admin") {
            teachers = await prisma.teacher.findMany({
                select: { id: true, name: true, surname: true },
                orderBy: [{ name: "asc" }, { surname: "asc" }]
            });
        }

        // Build where clause
        const where: any = {};
        
        if (targetTeacherId) {
            where.teacherId = targetTeacherId;
        }

        if (from || to) {
            where.date = {};
            if (from) {
                const fromDate = new Date(from);
                fromDate.setHours(0, 0, 0, 0);
                where.date.gte = fromDate;
            }
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                where.date.lte = toDate;
            }
        }

        // Fetch attendance data
        const [attendances, total] = await Promise.all([
            prisma.teacherAttendance.findMany({
                where,
                include: {
                    teacher: {
                        select: { id: true, name: true, surname: true, username: true }
                    }
                },
                orderBy: { date: "desc" },
                skip: (p - 1) * ITEM_PER_PAGE,
                take: ITEM_PER_PAGE,
            }),
            prisma.teacherAttendance.count({ where })
        ]);

        data = attendances;
        count = total;

        // Calculate statistics
        const allAttendance = await prisma.teacherAttendance.findMany({ where });
        const totalDays = allAttendance.length;
        const presentDays = allAttendance.filter(a => a.present).length;
        const absentDays = totalDays - presentDays;
        const percentage = totalDays === 0 ? 0 : ((presentDays / totalDays) * 100);

        statistics = {
            totalDays,
            presentDays,
            absentDays,
            percentage: parseFloat(percentage.toFixed(1))
        };

    } catch (error) {
        console.error("Error fetching teacher attendance history:", error);
    }

    // Generate chart data (last 7 days)
    const chartData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayAttendance = data.filter(a => {
            const attendanceDate = new Date(a.date);
            attendanceDate.setHours(0, 0, 0, 0);
            return attendanceDate.getTime() === date.getTime();
        });

        chartData.push({
            name: dayName,
            present: dayAttendance.filter(a => a.present).length,
            absent: dayAttendance.filter(a => !a.present).length,
        });
    }

    const columns = [
        {
            header: "Date",
            accessor: "date",
            className: "text-center",
        },
        ...(role === "admin" 
            ? [{
                header: "Teacher",
                accessor: "teacher",
                className: "text-center",
            }]
            : []
        ),
        {
            header: "Status",
            accessor: "status",
            className: "text-center",
        },
    ];

    const renderRow = (item: any) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="text-center p-4">
                {new Date(item.date).toLocaleDateString()}
            </td>
            {role === "admin" && (
                <td className="text-center p-4">
                    {item.teacher.name} {item.teacher.surname}
                </td>
            )}
            <td className="text-center p-4">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.present
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                >
                    {item.present ? "Present" : "Absent"}
                </span>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-lg font-semibold">
                    {role === "teacher" ? "My Attendance History" : "Teacher Attendance History"}
                </h1>
            </div>

            {/* Filters */}
            <TeacherAttendanceFilter 
                teachers={teachers}
                showTeacherSelect={role === "admin"}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
                <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-2xl font-bold text-blue-600">{statistics.totalDays}</h3>
                    <p className="text-sm text-gray-600">Total Days</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-2xl font-bold text-green-600">{statistics.presentDays}</h3>
                    <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="text-2xl font-bold text-red-600">{statistics.absentDays}</h3>
                    <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-md">
                    <h3 className="text-2xl font-bold text-purple-600">{statistics.percentage}%</h3>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Attendance Trend</h3>
                <div className="h-80">
                    <TeacherAttendanceChart data={chartData} />
                </div>
            </div>

            {/* Table */}
            <Table columns={columns} renderRow={renderRow} data={data} />

            {/* Pagination */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default TeacherAttendanceHistoryPage;