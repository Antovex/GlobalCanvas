import DbError from "@/components/DbError";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/util";
import { Prisma, Student } from "@prisma/client";
import Image from "next/image";
import AttendanceToggle from "@/components/AttendanceToggle";
import AttendanceDatePicker from "@/components/AttendanceDatePicker";
import LessonSelector from "@/components/LessonSelector";
import ClassFilter from "@/components/ClassFilter";

type StudentList = Student & { 
    class: { name: string };
};

const AttendancePage = async ({ searchParams }: any) => {
    const role = await getUserRole();

    // const { page, ...queryParams } = searchParams;
    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }
    const { page, lessonId, classFilter, ...queryParams } = normalized;

    const p = page ? parseInt(page) : 1;
    const selectedLessonId = lessonId ? parseInt(lessonId) : null;

    // Date for date picker from URL params
    const selectedDateRaw = normalized.date; // format expected: YYYY-MM-DD or ISO
    const selectedDate = selectedDateRaw ? new Date(selectedDateRaw).toISOString() : undefined;

    // URL PARAMS CONDITIONS
    const query: Prisma.StudentWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.OR = [
                            { name: { contains: value, mode: "insensitive" } },
                            { surname: { contains: value, mode: "insensitive" } }
                        ];
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // Add class filter if specified
    if (classFilter) {
        query.classId = parseInt(classFilter);
    }

    let data: StudentList[] = [];
    let count = 0;
    let lessons: any[] = [];
    let classes: any[] = [];
    let dbError = null;
    
    try {
        // Fetch lessons for the lesson selector
        lessons = await prisma.lesson.findMany({
            include: {
                subject: { select: { name: true } },
                class: { select: { name: true } },
            },
            orderBy: [
                { class: { name: "asc" } },
                { subject: { name: "asc" } },
                { name: "asc" }
            ],
        });

        // Fetch all classes for filtering
        classes = await prisma.class.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });

        // Fetch all students
        const [students, studentCount] = await prisma.$transaction([
            prisma.student.findMany({
                where: query,
                include: {
                    class: { select: { name: true } },
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
                orderBy: [
                    { class: { name: "asc" } },
                    { name: "asc" },
                    { surname: "asc" }
                ],
            }),
            prisma.student.count({
                where: query,
            }),
        ]);

        data = students;
        count = studentCount;
    } catch (error: any) {
        dbError = error.message || "Unable to connect to the database.";
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                {dbError && <DbError message={dbError} />}
            </div>
        );
    }

    // --- load existing attendance for this lesson + day so we can show initial state ---
    const parsedDateForQuery = selectedDate ? new Date(selectedDate) : new Date();
    const dayStart = new Date(parsedDateForQuery);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const studentIds = data.map((s) => s.id);
    const attendanceByStudent: Record<string, any> = {};
    
    if (studentIds.length > 0 && selectedLessonId) {
        const attendances = await prisma.attendance.findMany({
            where: {
                lessonId: selectedLessonId,
                studentId: { in: studentIds },
                date: { gte: dayStart, lt: dayEnd },
            },
        });
        for (const a of attendances) {
            attendanceByStudent[a.studentId] = a;
        }
    }
    // --- end attendance preload ---

    const columns = [
        {
            header: "Info",
            accessor: "info",
            className: "text-center",
        },
        {
            header: "Student ID",
            accessor: "studentId",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Class",
            accessor: "class",
            className: "hidden md:table-cell text-center",
        },
        ...(role === "admin" || role === "teacher"
            ? [
                  {
                      header: "Attendance",
                      accessor: "attendance",
                      className: "text-center",
                  },
              ]
            : [
                  {
                      header: " ",
                      accessor: "empty_action",
                      className: "text-center",
                  },
              ]),
    ];

    // Make each row of the table for passing it to the Table component
    const renderRow = (item: StudentList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                <Image
                    src={item.img || "/noAvatar.png"}
                    alt="Student photo"
                    width={40}
                    height={40}
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col items-center justify-center">
                    <h3 className="font-semibold">{item.name} {item.surname}</h3>
                    <p className="text-xs text-gray-500">{item.class.name}</p>
                </div>
            </td>
            <td className="hidden md:table-cell text-center">
                {item.username}
            </td>
            <td className="hidden md:table-cell text-center">
                {item.class.name}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {(role === "admin" || role === "teacher") && selectedLessonId && (
                        // map current DB record to the toggle's initial value
                        (() => {
                            const att = attendanceByStudent[item.id];
                            const initial = att ? att.status : null;
                            return (
                                <AttendanceToggle
                                    studentId={item.id}
                                    lessonId={selectedLessonId}
                                    date={selectedDate}
                                    initial={initial}
                                />
                            );
                        })()
                    )}
                    {(role === "admin" || role === "teacher") && !selectedLessonId && (
                        <span className="text-sm text-gray-500">Select a lesson</span>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    Take Attendance
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <AttendanceDatePicker initialDate={selectedDateRaw} />
                        <LessonSelector 
                            lessons={lessons} 
                            currentLessonId={lessonId}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Class Filter */}
                        <ClassFilter 
                            classes={classes} 
                            currentClassId={classFilter}
                        />
                        <TableSearch placeholder="Search with Student Name..." />
                    </div>
                </div>
            </div>

            {/* Lesson Selection Info */}
            {selectedLessonId && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-sm font-medium text-blue-800">
                            Taking attendance for:
                        </span>
                        <span className="text-sm text-blue-700">
                            {lessons.find(l => l.id === selectedLessonId)?.subject.name} - {" "}
                            {lessons.find(l => l.id === selectedLessonId)?.name} {" "}
                            ({lessons.find(l => l.id === selectedLessonId)?.class.name})
                        </span>
                    </div>
                </div>
            )}

            {!selectedLessonId && (role === "admin" || role === "teacher") && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        Please select a lesson and date to start taking attendance.
                    </p>
                </div>
            )}

            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={data} />

            {/* PAGINATION BAR */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default AttendancePage;
