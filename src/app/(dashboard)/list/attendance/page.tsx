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

type StudentList = Student & { class: { name: string } };

const AttendancePage = async ({
    searchParams,
}: {
    // searchParams: { [key: string]: string | undefined };
    searchParams:
        | { [key: string]: string | undefined }
        | Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    const role = await getUserRole();

    // const { page, ...queryParams } = searchParams;
    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }
    const { page, ...queryParams } = normalized;

    const p = page ? parseInt(page) : 1;

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
                        query.name = { contains: value, mode: "insensitive" };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    let data = [];
    let count = 0;
    let dbError = null;
    try {
        [data, count] = await prisma.$transaction([
            prisma.student.findMany({
                where: query,
                include: {
                    class: { select: {name: true} },
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.student.count({
                where: query,
            }),
        ]);
    } catch (error: any) {
        dbError = error.message || "Unable to connect to the database.";
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                {dbError && <DbError message={dbError} />}
            </div>
        );
    }

    // --- load existing attendance for this lesson + day so we can show initial state ---
    const LESSON_ID = 1; // TODO: replace with selected lesson id (or pass from UI)
    const parsedDateForQuery = selectedDate ? new Date(selectedDate) : new Date();
    const dayStart = new Date(parsedDateForQuery);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const studentIds = (data as StudentList[]).map((s) => s.id);
    const attendanceByStudent: Record<string, any> = {};
    if (studentIds.length > 0) {
        const attendances = await prisma.attendance.findMany({
            where: {
                lessonId: LESSON_ID,
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
            header: "Grade",
            accessor: "grade",
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
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.class.name}</p>
                </div>
            </td>
            <td className="hidden md:table-cell text-center">
                {item.username}
            </td>
            <td className="hidden md:table-cell text-center">
                {item.class.name[0]}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {(role === "admin" || role === "teacher") && (
                        // map current DB record to the toggle's initial value
                        (() => {
                            const att = attendanceByStudent[item.id];
                            const initial = att ? (att.present ? "PRESENT" : "ABSENT") : null;
                            return (
                                <AttendanceToggle
                                    // force remount when selectedDate changes
                                    // key={`${item.id}-${selectedDate ?? "today"}`}
                                    studentId={item.id}
                                    lessonId={LESSON_ID}
                                    date={selectedDate}
                                    initial={initial}
                                />
                            );
                        })()
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
                    All Students
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <AttendanceDatePicker initialDate={selectedDateRaw} />
                    <TableSearch placeholder="Search with Student Name..." />
                    {/* Filter Button */}
                    <div className="flex items-center gap-4 self-end">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow"
                            aria-label="Filter students"
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
                        {/* Add new student button */}
                        {/* {role === "admin" && (
                            // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            //     <Image
                            //         src="/plus.png"
                            //         alt=""
                            //         width={14}
                            //         height={14}
                            //     />
                            // </button>
                            <FormModal table="student" type="create" />
                        )} */}
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

export default AttendancePage;
