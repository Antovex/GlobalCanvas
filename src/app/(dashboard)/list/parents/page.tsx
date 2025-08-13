import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { parentsData, role } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
// import Link from "next/link";

type ParentList = Parent & { students: Student[] };

const columns = [
    {
        header: "Info",
        accessor: "info",
        className: "text-center",
    },
    {
        header: "Student Names",
        accessor: "students",
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
    {
        header: "Actions",
        accessor: "action",
        className: "text-center",
    },
];

// Make each row of the table for passing it to the Table component
const renderRow = (item: ParentList) => (
    <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
    >
        <td className="flex items-center justify-center gap-4 p-4">
            <div className="flex flex-col items-center justify-center">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-xs text-gray-500">{item?.email}</p>
            </div>
        </td>
        <td className="hidden md:table-cell text-center">
            {item.students.map((student) => student.name).join(", ")}
        </td>
        <td className="hidden md:table-cell text-center">{item.phone}</td>
        <td className="hidden md:table-cell text-center">{item.address}</td>
        <td>
            <div className="flex items-center justify-center gap-2 px-4">
                {/* DELETE or EDIT A PARENT */}
                {role === "admin" && (
                    <>
                        <FormModal table="parent" type="update" data={item} />
                        <FormModal table="parent" type="delete" id={item.id} />
                    </>
                )}
            </div>
        </td>
    </tr>
);

const ParentListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, ...queryParams } = searchParams;

    const p = page ? parseInt(page) : 1;

    // URL PARAMS CONDITIONS
    const query: Prisma.ParentWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.OR = [
                            { name: { contains: value, mode: "insensitive" } },
                            {
                                students: {
                                    some: {
                                        name: {
                                            contains: value,
                                            mode: "insensitive",
                                        },
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

    let data = [];
    let count = 0;
    let dbError = null;
    try {
        [data, count] = await prisma.$transaction([
            prisma.parent.findMany({
                where: query,
                include: {
                    students: true,
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.parent.count({
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

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    All Parents
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search with Parent or Student Name..." />
                    {/* Filter Button */}
                    <div className="flex items-center gap-4 self-end">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow"
                            aria-label="Filter parents"
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
                        {/* Add new parent button */}
                        {role === "admin" && (
                            <FormModal table="parent" type="create" />
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

export default ParentListPage;
