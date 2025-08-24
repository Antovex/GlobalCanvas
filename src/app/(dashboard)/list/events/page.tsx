import DbError from "@/components/DbError";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { eventsData, role } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";

type EventList = Event & { class: Class };

const EventListPage = async ({ searchParams }: any) => {
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
    const query: Prisma.EventWhereInput = {};

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

    // ROLE CONDITIONS - apply only when users are non-admin
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
            prisma.event.findMany({
                where: query,
                include: {
                    class: true,
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
            }),
            prisma.event.count({
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
        {
            header: "Start Time",
            accessor: "startTime",
            className: "hidden md:table-cell text-center",
        },
        {
            header: "End Time",
            accessor: "endTime",
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
    const renderRow = (item: EventList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex items-center justify-center gap-4 p-4">
                {item.title}
            </td>
            <td className="text-center">{item.class?.name || "-"}</td>
            <td className="hidden md:table-cell text-center">
                {new Intl.DateTimeFormat("en-US").format(item.startTime)}
            </td>
            <td className="hidden md:table-cell text-center">
                {item.startTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })}
            </td>
            <td className="hidden md:table-cell text-center">
                {item.endTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })}
            </td>
            <td>
                <div className="flex items-center justify-center gap-2 px-4">
                    {/* EDIT or DELETE AN EVENT */}
                    {role === "admin" && (
                        <>
                            <FormModal
                                table="event"
                                type="update"
                                data={item}
                            />
                            <FormModal
                                table="event"
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
                    All Events
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
                            <FormModal table="event" type="create" />
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

export default EventListPage;
