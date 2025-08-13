const Table = ({
    columns,
    renderRow,
    data,
}: {
    columns: { header: string; accessor: string; className?: string }[];
    renderRow: (item: any) => React.ReactNode;
    data: any[];
}) => {
    return (
        <table className="w-full mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
            <thead>
                <tr className="text-left text-gray-500 text-sm bg-slate-100">
                    {columns.map((col) => (
                        <th
                            key={col.accessor}
                            className={`py-3 px-4 font-semibold ${col.className ?? ""}`}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length} className="py-10">
                            <div className="flex flex-col items-center justify-center">
                                <div className="bg-purple-50 border border-purple-200 text-gray-500 px-6 py-4 rounded-lg shadow-sm">
                                    <span className="block text-center text-lg font-medium">
                                        No data available
                                    </span>
                                    <span className="block text-center text-sm text-gray-400 mt-1">
                                        Try adjusting your filters or search.
                                    </span>
                                </div>
                            </div>
                        </td>
                    </tr>
                ) : (
                    data.map((item) => renderRow(item))
                )}
            </tbody>
        </table>
    );
};

export default Table;
