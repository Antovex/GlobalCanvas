import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/util";
import { Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

type StudentList = Student & { class: { name: string } };

const StudentListPage = async ({ searchParams }: any) => {
    const role = await getUserRole();

    // const { page, ...queryParams } = searchParams;
    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }
    const { page, ...queryParams } = normalized;

    const p = page ? parseInt(page) : 1;

    // URL PARAMS CONDITIONS
    const query: Prisma.StudentWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "teacherId":
                        query.class = {
                            lessons: {
                                some: {
                                    teacherId: value,
                                },
                            },
                        };
                        break;
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
                    class: true,
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
        {
            header: "Phone",
            accessor: "phone",
            className: "hidden lg:table-cell text-center",
        },
        {
            header: "Address",
            accessor: "address",
            className: "hidden lg:table-cell text-center",
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
            <td className="hidden md:table-cell text-center">{item.phone}</td>
            <td className="hidden md:table-cell text-center">{item.address}</td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {/* VIEW A STUDENT  */}
                    <Link href={`/list/students/${item.id}`}>
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-Sky"
                            aria-label="View student"
                        >
                            <Image
                                src="/view.png"
                                alt=""
                                aria-hidden="true"
                                width={16}
                                height={16}
                            />
                        </button>
                    </Link>
                    {/* DELETE A STUDENT */}
                    {role === "admin" && (
                        // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-Purple">
                        //     <Image
                        //         src="/delete.png"
                        //         alt=""
                        //         width={16}
                        //         height={16}
                        //     />
                        // </button>
                        <FormModal table="student" type="delete" id={item.id} />
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
                        {role === "admin" && (
                            // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            //     <Image
                            //         src="/plus.png"
                            //         alt=""
                            //         width={14}
                            //         height={14}
                            //     />
                            // </button>
                            <FormModal table="student" type="create" />
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

export default StudentListPage;
