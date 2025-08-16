import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/util";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";

type ClassList = Class & { supervisor: Teacher };

const ClassListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {

    const role = await getUserRole();

    const { page, ...queryParams } = searchParams;

    const p = page ? parseInt(page) : 1;

    // URL PARAMS CONDITIONS
    const query: Prisma.ClassWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "teacherId":
                        query.supervisorId = value;
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
            prisma.class.findMany({
                where: query,
                include: {
                    supervisor: true,
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.class.count({
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
            header: "Class Name",
            accessor: "name",
            className: "text-center",
        },
        {
            header: "Capacity",
            accessor: "capacity",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Grade",
            accessor: "grade",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "Supervisor",
            accessor: "supervisor",
            className: "hidden md:table-cell text-center",
        },
        ...(role === "admin"
            ? [
                  {
                      header: "Actions",
                      accessor: "action",
                      className: "text-center",
                  },
              ]
            : []),
    ];

    // Make each row of the table for passing it to the Table component
    const renderRow = (item: ClassList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="text-center gap-4 p-4">{item.name}</td>
            <td className="hidden md:table-cell text-center">
                {item.capacity}
            </td>
            <td className="hidden md:table-cell text-center">{item.name[0]}</td>
            <td className="hidden md:table-cell text-center">
                {item.supervisor.name + " " + item.supervisor.surname}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {/* EDIT or DELETE A CLASS */}
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="class"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="class"
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
                    All Classes
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search with Class Name..." />
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
                        {role === "admin" && (
                            <FormModal table="class" type="create" />
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

export default ClassListPage;
