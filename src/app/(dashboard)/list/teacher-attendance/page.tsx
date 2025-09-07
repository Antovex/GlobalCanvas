import DbError from "@/components/DbError";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/util";
import { Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import TeacherAttendanceToggle from "@/components/TeacherAttendanceToggle";
import AttendanceDatePicker from "@/components/AttendanceDatePicker";
import { redirect } from "next/navigation";

type TeacherList = Teacher;

const TeacherAttendancePage = async ({ searchParams }: any) => {
    const role = await getUserRole();

    // Only admins can access teacher attendance
    if (role !== "admin") {
        redirect("/");
    }

    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }
    const { page, ...queryParams } = normalized;

    const p = page ? parseInt(page) : 1;

    // Date for date picker from URL params
    const selectedDateRaw = normalized.date;
    const selectedDate = selectedDateRaw ? new Date(selectedDateRaw).toISOString() : undefined;

    // URL PARAMS CONDITIONS
    const query: Prisma.TeacherWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.name = { contains: value, mode: "insensitive" };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    let data: TeacherList[] = [];
    let count = 0;
    let dbError = null;

    try {
        const [teachers, teacherCount] = await prisma.$transaction([
            prisma.teacher.findMany({
                where: query,
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
                orderBy: [
                    { name: "asc" },
                    { surname: "asc" }
                ],
            }),
            prisma.teacher.count({
                where: query,
            }),
        ]);

        data = teachers;
        count = teacherCount;
    } catch (error: any) {
        dbError = error.message || "Unable to connect to the database.";
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                {dbError && <DbError message={dbError} />}
            </div>
        );
    }

    // Load existing teacher attendance for selected date
    const parsedDateForQuery = selectedDate ? new Date(selectedDate) : new Date();
    const dayStart = new Date(parsedDateForQuery);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const teacherIds = data.map((t) => t.id);
    const attendanceByTeacher: Record<string, any> = {};

    if (teacherIds.length > 0) {
        const attendances = await prisma.teacherAttendance.findMany({
            where: {
                teacherId: { in: teacherIds },
                date: { gte: dayStart, lt: dayEnd },
            },
        });
        for (const a of attendances) {
            attendanceByTeacher[a.teacherId] = a;
        }
    }

    const columns = [
        {
            header: "Info",
            accessor: "info",
            className: "text-center",
        },
        {
            header: "Teacher ID",
            accessor: "teacherId",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Attendance",
            accessor: "attendance",
            className: "text-center",
        },
    ];

    const renderRow = (item: TeacherList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                <Image
                    src={item.img || "/noAvatar.png"}
                    alt="Teacher photo"
                    width={40}
                    height={40}
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col items-center justify-center">
                    <h3 className="font-semibold">{item.name} {item.surname}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell text-center">
                {item.username}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {(() => {
                        const att = attendanceByTeacher[item.id];
                        const initial = att ? att.present : null;
                        return (
                            <TeacherAttendanceToggle
                                teacherId={item.id}
                                date={selectedDate}
                                initial={initial}
                            />
                        );
                    })()}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    Teacher Attendance
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <AttendanceDatePicker initialDate={selectedDateRaw} />
                    <TableSearch placeholder="Search with Teacher Name..." />
                    {/* Filter Button */}
                    <div className="flex items-center gap-4 self-end">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow"
                            aria-label="Filter teachers"
                        >
                            <Image
                                src="/filter.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                        {/* Sort Button */}
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/sort.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data} />

            {/* PAGINATION BAR */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default TeacherAttendancePage;