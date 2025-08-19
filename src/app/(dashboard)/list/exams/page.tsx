import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
// import Link from "next/link";

type ExamList = Exam & {
    lesson: {
        subject: Subject;
        class: Class;
        teacher: Teacher;
    };
};

const ExamListPage = async ({
    searchParams,
}: {
    // searchParams: { [key: string]: string | undefined };
    searchParams:
        | { [key: string]: string | undefined }
        | Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
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
    const query: Prisma.ExamWhereInput = {};

    query.lesson = {};
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "classId":
                        query.lesson.classId = parseInt(value);
                        break;
                    case "teacherId":
                        query.lesson.teacherId = value;
                        break;
                    case "search":
                        query.lesson.subject = {
                            name: {
                                contains: value,
                                mode: "insensitive",
                            },
                        };
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
            query.lesson.teacherId = currentUserId!;
            break;
        case "student":
            query.lesson.class = {
                students: {
                    some: {
                        id: currentUserId!,
                    },
                },
            };
            break;
        case "parent":
            query.lesson.class = {
                students: {
                    some: {
                        parentId: currentUserId!,
                    },
                },
            };
            break;
        default:
            break;
    }

    let data = [];
    let count = 0;
    let dbError = null;
    try {
        [data, count] = await prisma.$transaction([
            prisma.exam.findMany({
                where: query,
                include: {
                    lesson: {
                        select: {
                            subject: { select: { name: true } },
                            teacher: { select: { name: true, surname: true } },
                            class: { select: { name: true } },
                        },
                    },
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.exam.count({
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

    const columns = [
        {
            header: "Subject Name",
            accessor: "name",
            className: "text-center",
        },
        {
            header: "Class",
            accessor: "class",
            className: "text-center",
        },
        {
            header: "Teacher",
            accessor: "teacher",
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
    const renderRow = (item: ExamList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                {item.lesson.subject.name}
            </td>
            <td className="text-center">{item.lesson.class.name}</td>
            <td className="hidden md:table-cell text-center">
                {item.lesson.teacher.name} {item.lesson.teacher.surname}
            </td>
            <td className="hidden md:table-cell text-center">
                {new Intl.DateTimeFormat("en-US").format(item.startTime)}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {/* EDIT or DELETE AN EXAM*/}
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormModal table="exam" type="update" data={item} />
                            <FormModal
                                table="exam"
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
                    All Exams
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search with Subject Name..." />
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
                        {/* Add new exam button */}
                        {(role === "admin" || role === "teacher") && (
                            <FormModal table="exam" type="create" />
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

export default ExamListPage;
