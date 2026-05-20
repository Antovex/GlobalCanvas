import DbError from "@/components/DbError";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import {
    DemoParentList,
    getDemoParents,
    shouldUseDemoData,
} from "@/lib/demoFallback";
import { prisma } from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { getUserRole } from "@/lib/util";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";

type ParentList = {
    id: string;
    name: string;
    surname: string;
    email?: string | null;
    phone?: string | null;
    address: string;
    students: { name: string; surname: string }[];
};

type ParentRow = ParentList | DemoParentList;

const ParentListPage = async ({ searchParams }: any) => {
    const role = await getUserRole();
    const demoFallbackAllowed = await shouldUseDemoData();

    if (role !== "admin") {
        redirect("/");
    }

    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }

    const { page = "1", ...queryParams } = normalized;
    const p = parseInt(page);

    const query: Prisma.ParentWhereInput = {};

    if (queryParams.search) {
        query.name = { contains: queryParams.search, mode: "insensitive" };
    }

    let data: ParentRow[] = [];
    let count = 0;
    let isDemoData = false;
    let dbError: string | null = null;

    try {
        const [parents, total] = await Promise.all([
            prisma.parent.findMany({
                where: query,
                include: {
                    students: {
                        select: { name: true, surname: true },
                    },
                },
                take: ITEM_PER_PAGE,
                skip: ITEM_PER_PAGE * (p - 1),
                orderBy: [{ name: "asc" }, { surname: "asc" }],
            }),
            prisma.parent.count({ where: query }),
        ]);

        data = parents;
        count = total;

        if (data.length === 0 && demoFallbackAllowed) {
            const demo = getDemoParents(p, queryParams.search);
            data = demo.data;
            count = demo.count;
            isDemoData = true;
        }
    } catch (error: any) {
        dbError = error.message || "Unable to connect to the database.";
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                {dbError && <DbError message={dbError} />}
            </div>
        );
    }

    const columns = [
        { header: "Info", accessor: "info", className: "text-center" },
        {
            header: "Students",
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
        ...(!isDemoData
            ? [{ header: "Actions", accessor: "action", className: "text-center" }]
            : [{ header: " ", accessor: "empty_action", className: "text-center" }]),
    ];

    const renderRow = (item: ParentRow) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="flex justify-center items-center gap-4 p-4">
                <div className="flex flex-col justify-center items-center">
                    <h3 className="font-semibold">
                        {item.name} {item.surname}
                    </h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell text-center">
                {item.students.map((student) => `${student.name} ${student.surname}`).join(", ") ||
                    "No students"}
            </td>
            <td className="hidden lg:table-cell text-center">{item.phone || "-"}</td>
            <td className="hidden lg:table-cell text-center">{item.address}</td>
            <td>
                <div className="flex items-center gap-2">
                    {!isDemoData && (
                        <>
                            <FormContainer table="parent" type="update" data={item} />
                            <FormContainer table="parent" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch placeholder="Search parents..." />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {!isDemoData && <FormContainer table="parent" type="create" />}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    );
};

export default ParentListPage;
