"use client";

import { useRouter, useSearchParams } from "next/navigation";

type StatusSelectorProps = {
    currentStatus?: string;
};

const StatusSelector = ({ currentStatus }: StatusSelectorProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (status) {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        params.delete("page"); // Reset to first page
        
        router.push(`?${params.toString()}`);
    };

    return (
        <select
            className="px-4 py-2 border rounded-md"
            value={currentStatus || ""}
            onChange={(e) => handleStatusChange(e.target.value)}
        >
            <option value="">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="COMPENSATION">Compensation</option>
        </select>
    );
};

export default StatusSelector;