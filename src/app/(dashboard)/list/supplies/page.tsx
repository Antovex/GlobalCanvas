import { prisma } from "@/lib/prisma";
import { getUserRole } from "@/lib/util";
import { redirect } from "next/navigation";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Table from "@/components/Table";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import QuantityControl from "@/components/QuantityControl";
import SupplyDeleteButton from "@/components/SupplyDeleteButton";
import { Prisma } from "@prisma/client";
import SupplyFormModal from "@/components/SupplyFormModal";

const SuppliesPage = async ({ searchParams }: any) => {
    const role = await getUserRole();

    // Only admins can access supplies management
    if (role !== "admin") {
        redirect("/unauthorized");
    }

    const rawSearchParams = await searchParams;
    const normalized: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(rawSearchParams || {})) {
        normalized[k] = Array.isArray(v) ? v[0] : (v as string | undefined);
    }

    const { page = "1", ...queryParams } = normalized;
    const p = parseInt(page);

    // Search query
    const query: Prisma.SupplyWhereInput = {};
    
    if (queryParams.search) {
        query.name = {
            contains: queryParams.search,
            mode: "insensitive",
        };
    }

    let data: any[] = [];
    let count = 0;

    try {
        const [supplies, total] = await Promise.all([
            prisma.supply.findMany({
                where: query,
                orderBy: { name: "asc" },
                skip: (p - 1) * ITEM_PER_PAGE,
                take: ITEM_PER_PAGE,
            }),
            prisma.supply.count({ where: query }),
        ]);

        data = supplies;
        count = total;
    } catch (error) {
        console.error("Error fetching supplies:", error);
    }

    const columns = [
        {
            header: "Supply Name",
            accessor: "name",
            className: "text-left",
        },
        {
            header: "Quantity",
            accessor: "quantity",
            className: "text-center",
        },
        {
            header: "Actions",
            accessor: "actions",
            className: "text-center",
        },
    ];

    const renderRow = (item: any) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
        >
            <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                            {item.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500">School Supply</p>
                    </div>
                </div>
            </td>
            <td className="text-center px-4 py-4">
                <QuantityControl 
                    supplyId={item.id}
                    currentQuantity={item.quantity}
                />
            </td>
            <td className="text-center px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                    <SupplyDeleteButton 
                        supplyId={item.id}
                        supplyName={item.name}
                    />
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-lg font-semibold">
                    School Supplies Inventory
                </h1>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    <TableSearch placeholder="Search supplies..." />
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <SupplyFormModal />
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/filter.png" alt="Filter" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image src="/sort.png" alt="Sort" width={14} height={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
                <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-blue-600">{count}</h3>
                    <p className="text-xs text-gray-600 mt-1">Total Items</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-green-600">
                        {data.filter(item => item.quantity > 0).length}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">In Stock</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-red-600">
                        {data.filter(item => item.quantity === 0).length}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">Out of Stock</p>
                </div>
            </div>

            {/* Desktop / Tablet Table */}
            <div className="hidden md:block">
                <div className="overflow-x-auto rounded-md border border-gray-100">
                    <Table columns={columns} renderRow={renderRow} data={data} />
                </div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3 mt-4">
                {data.map(item => (
                    <div
                        key={item.id}
                        className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <span className="text-blue-600 font-semibold text-sm">
                                    {item.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="text-[11px] text-gray-500 mt-0.5">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <QuantityControl
                                supplyId={item.id}
                                currentQuantity={item.quantity}
                            />
                            <SupplyDeleteButton
                                supplyId={item.id}
                                supplyName={item.name}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
                <Pagination page={p} count={count} />
            </div>
        </div>
    );
};

export default SuppliesPage;