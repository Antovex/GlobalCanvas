import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import StudentSelector from "@/components/StudentSelector";
import StatusSelector from "@/components/StatusSelector";
import { redirect } from "next/navigation";

type AttendanceList = {
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "COMPENSATION";
    student: {
        id: string;
        name: string;
        surname: string;
        class: {
            name: string;
        };
    };
    lesson: {
        name: string;
        subject: {
            name: string;
        };
    };
};

const columns = [
    {
        header: "Student",
        accessor: "student",
    },
    {
        header: "Class",
        accessor: "class",
        className: "hidden md:table-cell text-center",
    },
    {
        header: "Subject",
        accessor: "subject",
        className: "hidden md:table-cell text-center",
    },
    {
        header: "Lesson",
        accessor: "lesson",
        className: "hidden md:table-cell text-center",
    },
    {
        header: "Date",
        accessor: "date",
    },
    {
        header: "Status",
        accessor: "status",
    },
];

const getStatusStyle = (status: "PRESENT" | "ABSENT" | "COMPENSATION") => {
    switch (status) {
        case "PRESENT":
            return "bg-green-100 text-green-700";
        case "ABSENT":
            return "bg-red-100 text-red-700";
        case "COMPENSATION":
            return "bg-yellow-100 text-yellow-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getStatusLabel = (status: "PRESENT" | "ABSENT" | "COMPENSATION") => {
    switch (status) {
        case "PRESENT":
            return "Present";
        case "ABSENT":
            return "Absent";
        case "COMPENSATION":
            return "Compensation";
        default:
            return "Unknown";
    }
};

const renderRow = (item: AttendanceList) => (
    <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-SkyLight"
    >
        <td className="flex items-center gap-4 p-4">
            <div className="flex flex-col">
                <h3 className="font-semibold">
                    {item.student.name + " " + item.student.surname}
                </h3>
                <p className="hidden md:table-cell text-xs text-gray-500">{item.student.id}</p>
            </div>
        </td>
        <td className="hidden md:table-cell p-4">{item.student.class.name}</td>
        <td className="hidden md:table-cell p-4">{item.lesson.subject.name}</td>
        <td className="hidden md:table-cell p-4">{item.lesson.name}</td>
        <td className="p-4">
            {new Intl.DateTimeFormat("en-US").format(new Date(item.date))}
        </td>
        <td className="p-4">
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                    item.status
                )}`}
            >
                {getStatusLabel(item.status)}
            </span>
        </td>
    </tr>
);

const MyAttendancePage = async ({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
    const userId = await getCurrentUserId();
    const role = await getUserRole();

    if (!userId) {
        redirect("/sign-in");
    }

    // Await searchParams
    const resolvedSearchParams = await searchParams;
    const { page, search, studentId, status } = resolvedSearchParams;
    const p = page ? parseInt(page) : 1;

    // Build where condition based on role
    let whereCondition: any = {};

    if (role === "student") {
        // Students can only see their own attendance
        whereCondition.studentId = userId;
    } else if (role === "parent") {
        // Parents can see their children's attendance
        const children = await prisma.student.findMany({
            where: { parentId: userId },
            select: { id: true },
        });
        const childIds = children.map((child) => child.id);

        if (childIds.length === 0) {
            // Parent has no children
            whereCondition.studentId = "no_children";
        } else {
            whereCondition.studentId = { in: childIds };
        }
    } else if (role === "admin" || role === "teacher") {
        // Admin/teacher can search for any student
        if (studentId) {
            whereCondition.studentId = studentId;
        } else if (search) {
            whereCondition.student = {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { surname: { contains: search, mode: "insensitive" } },
                    { id: { contains: search, mode: "insensitive" } },
                ],
            };
        }
    }

    // Add status filter if provided
    if (status && ["PRESENT", "ABSENT", "COMPENSATION"].includes(status)) {
        whereCondition.status = status;
    }

    // Fetch attendance data
    const [attendanceData, count] = await prisma.$transaction([
        prisma.attendance.findMany({
            where: whereCondition,
            include: {
                student: {
                    include: {
                        class: { select: { name: true } },
                    },
                },
                lesson: {
                    include: {
                        subject: { select: { name: true } },
                    },
                },
            },
            orderBy: { date: "desc" },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
        }),
        prisma.attendance.count({ where: whereCondition }),
    ]);

    // Calculate attendance statistics
    const totalAttendance = await prisma.attendance.count({
        where: whereCondition,
    });
    const presentCount = await prisma.attendance.count({
        where: { ...whereCondition, status: "PRESENT" },
    });
    const absentCount = await prisma.attendance.count({
        where: { ...whereCondition, status: "ABSENT" },
    });
    const compensationCount = await prisma.attendance.count({
        where: { ...whereCondition, status: "COMPENSATION" },
    });
    
    // Calculate effective attendance rate (Present + Compensation)
    const effectiveAttendance = presentCount + compensationCount;
    const attendanceRate =
        totalAttendance > 0
            ? ((effectiveAttendance / totalAttendance) * 100).toFixed(1)
            : "0";

    // Get list of students for admin/teacher search
    let students: {
        id: string;
        name: string;
        surname: string;
        class: { name: string };
    }[] = [];
    if (role === "admin" || role === "teacher") {
        students = await prisma.student.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                class: { select: { name: true } },
            },
            orderBy: [{ name: "asc" }, { surname: "asc" }],
        });
    }

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TITLE */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    {role === "student"
                        ? "My Attendance"
                        : role === "parent"
                        ? "Children's Attendance"
                        : "Student Attendance"}
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    {/* Statistics */}
                    <div className="flex items-center gap-4 self-end">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                                {presentCount}
                            </div>
                            <div className="text-xs text-gray-500">Present</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-yellow-600">
                                {compensationCount}
                            </div>
                            <div className="text-xs text-gray-500">Compensation</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">
                                {absentCount}
                            </div>
                            <div className="text-xs text-gray-500">Absent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                                {attendanceRate}%
                            </div>
                            <div className="text-xs text-gray-500">Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
                {(role === "admin" || role === "teacher") && (
                    <>
                        {/* Student search for admin/teacher */}
                        <TableSearch placeholder="Search students..." />

                        {/* Student selector dropdown */}
                        <StudentSelector
                            students={students}
                            currentStudentId={studentId}
                        />
                    </>
                )}
                
                {/* Status filter */}
                <StatusSelector currentStatus={status} />
            </div>

            {/* LIST */}
            <Table
                columns={columns}
                renderRow={renderRow}
                data={attendanceData}
            />

            {/* PAGINATION */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default MyAttendancePage;
