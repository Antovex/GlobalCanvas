import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";

type AnnouncementList = Announcement & { class: Class };

const AnnouncementListPage = async ({
    searchParams,
}: {
    // searchParams: { [key: string]: string | undefined };
    searchParams:
        | { [key: string]: string | undefined }
        | Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
    // Get role inside the function
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
    const query: Prisma.AnnouncementWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "search":
                        query.title = { contains: value, mode: "insensitive" };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // ROLE CONDITIONS
    if (role !== "admin") {
        const roleConditions = {
            teacher: { lessons: { some: { teacherId: currentUserId! } } },
            student: { students: { some: { id: currentUserId! } } },
            parent: { students: { some: { parentId: currentUserId! } } },
        };

        query.OR = [
            { classId: null },
            {
                class:
                    roleConditions[role as keyof typeof roleConditions] || {},
            },
        ];
    }
    let data = [];
    let count = 0;
    let dbError = null;
    try {
        [data, count] = await prisma.$transaction([
            prisma.announcement.findMany({
                where: query,
                include: {
                    class: true,
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.announcement.count({
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
            header: "Title",
            accessor: "title",
            className: "text-center",
        },
        {
            header: "Class",
            accessor: "class",
            className: "text-center",
        },
        {
            header: "Date",
            accessor: "date",
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
            : [
                  {
                      header: " ",
                      accessor: "empty_action",
                      className: "text-center",
                  },
              ]),
    ];

    // Make each row of the table for passing it to the Table component
    const renderRow = (item: AnnouncementList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                {item.title}
            </td>
            <td className="text-center">{item.class?.name || "-"}</td>
            <td className="hidden md:table-cell text-center">
                {item.date ? (
                    new Intl.DateTimeFormat("en-US").format(new Date(item.date))
                ) : (
                    <span className="text-gray-400">No date</span>
                )}
            </td>
            {role === "admin" && (
                <td>
                    <div className="flex items-center justify-center gap-2 px-4">
                        {/* EDIT or DELETE AN ANNOUNCEMENT */}
                        <>
                            <FormModal
                                table="announcement"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="announcement"
                                type="delete"
                                id={item.id}
                            />
                        </>
                    </div>
                </td>
            )}
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    All Announcements
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search with Title..." />
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
                            <FormModal table="announcement" type="create" />
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

export default AnnouncementListPage;
