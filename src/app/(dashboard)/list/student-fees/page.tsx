import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/util";
import { redirect } from "next/navigation";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import MonthSelector from "@/components/MonthSelector";
import StudentFeesClient from "@/components/StudentFeesClient";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";

type StudentWithFeeInfo = {
    id: string;
    name: string;
    surname: string;
    parent: {
        name: string;
        surname: string;
        phone: string;
    } | null;
    class: {
        name: string;
    };
    fees: {
        id: number;
        amount: number;
        paid: boolean;
        paidDate: Date | null;
    }[];
};

const StudentFeesPage = async ({ searchParams }: any) => {
    const role = await getUserRole();

    if (role !== "admin") {
        redirect("/unauthorized");
    }

    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }

    const { page = "1", month, search, ...queryParams } = normalized;
    const p = parseInt(page);

    // Default to current month if no month specified
    const selectedMonth = month || new Date().toISOString().slice(0, 7);

    // Build search query
    const query: Prisma.StudentWhereInput = {};
    if (search) {
        query.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
            {
                parent: {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { surname: { contains: search, mode: "insensitive" } },
                    ],
                },
            },
        ];
    }

    let data: StudentWithFeeInfo[] = [];
    let count = 0;
    let statistics = {
        totalStudents: 0,
        paidCount: 0,
        unpaidCount: 0,
    };

    try {
        // Fetch students with their fee information
        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where: query,
                include: {
                    parent: {
                        select: {
                            name: true,
                            surname: true,
                            phone: true,
                        },
                    },
                    class: {
                        select: { name: true },
                    },
                    fees: {
                        where: { month: selectedMonth },
                        select: {
                            id: true,
                            amount: true,
                            paid: true,
                            paidDate: true,
                        },
                    },
                },
                orderBy: [{ name: "asc" }, { surname: "asc" }],
                skip: (p - 1) * ITEM_PER_PAGE,
                take: ITEM_PER_PAGE,
            }),
            prisma.student.count({ where: query }),
        ]);

        data = students;
        count = total;

        // Calculate statistics for the selected month
        const allStudentsForMonth = await prisma.student.findMany({
            include: {
                fees: {
                    where: { month: selectedMonth },
                },
            },
        });

        const totalStudents = allStudentsForMonth.length;
        const studentsWithFees = allStudentsForMonth.filter(
            (s) => s.fees.length > 0
        );
        const paidCount = studentsWithFees.filter(
            (s) => s.fees[0]?.paid
        ).length;
        const unpaidCount = totalStudents - paidCount;

        statistics = {
            totalStudents,
            paidCount,
            unpaidCount,
        };
    } catch (error) {
        console.error("Error fetching student fees:", error);
    }

    const columns = [
        {
            header: "Student Info",
            accessor: "info",
            className: "text-left",
        },
        {
            header: "Parent Info",
            accessor: "parent",
            className: "hidden md:table-cell text-left",
        },
        {
            header: "Class",
            accessor: "class",
            className: "hidden lg:table-cell text-center",
        },
        {
            header: "Amount",
            accessor: "amount",
            className: "text-center",
        },
        {
            header: "Status",
            accessor: "status",
            className: "text-center",
        },
    ];

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h1 className="text-lg font-semibold">
                    Student Fees Management
                </h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <MonthSelector />
                    <TableSearch placeholder="Search students or parents..." />
                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/filter.png"
                                alt="Filter"
                                width={14}
                                height={14}
                            />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/sort.png"
                                alt="Sort"
                                width={14}
                                height={14}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Client-side component with real-time updates */}
            <StudentFeesClient 
                data={data}
                selectedMonth={selectedMonth}
                initialStatistics={statistics}
                columns={columns}
            />

            {/* Pagination */}
            <Pagination page={p} count={count} />
        </div>
    );
};

export default StudentFeesPage;