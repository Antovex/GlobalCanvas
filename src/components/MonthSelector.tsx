"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MonthSelector = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentMonth =
        searchParams.get("month") || new Date().toISOString().slice(0, 7); // Format: YYYY-MM

    const handleMonthChange = (newMonth: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", newMonth);
        params.delete("page"); // Reset pagination
        router.push(`${pathname}?${params.toString()}`);
    };

    // Generate month options (current and previous 11 months)
    const monthOptions = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthValue = date.toISOString().slice(0, 7);
        const monthLabel = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
        monthOptions.push({ value: monthValue, label: monthLabel });
    }

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default MonthSelector;
