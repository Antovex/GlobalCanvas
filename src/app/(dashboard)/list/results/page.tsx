import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { Prisma } from "@prisma/client";
import Image from "next/image";

type ResultList = {
    id: number;
    title: string;
    studentName: string;
    studentSurname: string;
    teacherName: string;
    teacherSurname: string;
    score: number;
    className: string;
    startTime: Date;
};

const ResultListPage = async ({ searchParams }: any) => {
    const role = await getUserRole();
    const currentUserId = await getCurrentUserId();

    // const { page, ...queryParams } = searchParams;
    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }
    const { page, ...queryParams } = normalized;

    const p = page ? parseInt(page) : 1;

    // URL PARAMS CONDITIONS
    const query: Prisma.ResultWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    // ERROR here, will be fixing it later
                    case "studentId":
                        query.studentId = value;
                        break;
                    case "search":
                        query.OR = [
                            {
                                exam: {
                                    title: {
                                        contains: value,
                                        mode: "insensitive",
                                    },
                                },
                            },
                            {
                                assignment: {
                                    title: {
                                        contains: value,
                                        mode: "insensitive",
                                    },
                                },
                            },
                            {
                                student: {
                                    name: {
                                        contains: value,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        ];
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // ROLE CONDITIONS

    switch (role) {
        case "admin":
            break;
        case "teacher":
            query.OR = [
                { exam: { lesson: { teacherId: currentUserId! } } },
                { assignment: { lesson: { teacherId: currentUserId! } } },
            ];
            break;
        case "student":
            query.studentId = currentUserId!;
            break;
        case "parent":
            query.student = {
                parentId: currentUserId!,
            };
            break;
        default:
            break;
    }

    let dataRes = [];
    let count = 0;
    let dbError = null;
    try {
        [dataRes, count] = await prisma.$transaction([
            prisma.result.findMany({
                where: query,
                include: {
                    student: {
                        select: {
                            name: true,
                            surname: true,
                        },
                    },
                    exam: {
                        include: {
                            lesson: {
                                select: {
                                    class: { select: { name: true } },
                                    teacher: {
                                        select: { name: true, surname: true },
                                    },
                                },
                            },
                        },
                    },
                    assignment: {
                        include: {
                            lesson: {
                                select: {
                                    class: { select: { name: true } },
                                    teacher: {
                                        select: { name: true, surname: true },
                                    },
                                },
                            },
                        },
                    },
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.result.count({
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

    const data = dataRes.map((item) => {
        const assessment = item.exam || item.assignment;

        if (!assessment) return null;

        const isExam = "startTime" in assessment;
        return {
            id: item.id,
            title: assessment.title,
            studentName: item.student.name,
            studentSurname: item.student.surname,
            teacherName: assessment.lesson.teacher.name,
            teacherSurname: assessment.lesson.teacher.surname,
            score: item.score,
            className: assessment.lesson.class.name,
            startTime: isExam ? assessment.startTime : assessment.startDate,
        };
    });

    const columns = [
        {
            header: "Title",
            accessor: "title",
            className: "text-center",
        },
        {
            header: "Student",
            accessor: "student",
            className: "text-center",
        },
        {
            header: "Score",
            accessor: "score",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Teacher",
            accessor: "teacher",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Class",
            accessor: "class",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Date",
            accessor: "date",
            className: "hidden md:table-cell text-center",
        },
        ...(role === "admin" || role === "teacher"
            ? [
                  {
                      header: "Actions",
                      accessor: "action",
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
    const renderRow = (item: ResultList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                {item.title}
            </td>
            <td className="text-center">
                {item.studentName} {item.studentSurname}
            </td>
            <td className="hidden md:table-cell text-center">{item.score}</td>
            <td className="hidden md:table-cell text-center">
                {item.teacherName} {item.teacherSurname}
            </td>
            <td className="hidden md:table-cell text-center">
                {item.className}
            </td>
            <td className="hidden md:table-cell text-center">
                {new Intl.DateTimeFormat("en-US").format(item.startTime)}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {/* EDIT or DELETE a RESULT */}
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormModal
                                table="result"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="result"
                                type="delete"
                                id={item.id}
                            />
                        </>
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
                    All Results
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search with Title or Student Name..." />
                    {/* Filter Button */}
                    <div className="flex items-center gap-4 self-end">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow"
                            aria-label="Filter classes"
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
                        {/* Add new subject button */}
                        {(role === "admin" || role === "teacher") && (
                            <FormModal table="result" type="create" />
                        )}
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

export default ResultListPage;
