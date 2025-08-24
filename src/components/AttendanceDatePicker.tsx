"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AttendanceDatePicker({ initialDate }: { initialDate?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const today = new Date().toISOString().slice(0, 10);
    const [value, setValue] = useState<string>(initialDate ? initialDate.slice(0,10) : (searchParams?.get("date") || today));

    function updateDate(newDate: string) {
        setValue(newDate);
        const params = new URLSearchParams(Object.fromEntries(Array.from(searchParams?.entries() || [])));
        if (newDate) params.set("date", newDate);
        else params.delete("date");
        // reset page param when changing date (optional)
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date:</label>
            <input
                type="date"
                value={value}
                onChange={(e) => updateDate(e.target.value)}
                className="p-2 rounded-md border text-sm"
                aria-label="Select attendance date"
            />
        </div>
    );
}