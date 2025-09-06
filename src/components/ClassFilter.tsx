"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type ClassFilterProps = {
    classes: {
        id: number;
        name: string;
    }[];
    currentClassId?: string;
};

const ClassFilter = ({ classes, currentClassId }: ClassFilterProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleClassChange = (classId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (classId) {
            params.set("classFilter", classId);
        } else {
            params.delete("classFilter");
        }
        params.delete("page"); // Reset to first page
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <select
            className="px-3 py-2 border rounded-md text-sm"
            value={currentClassId || ""}
            onChange={(e) => handleClassChange(e.target.value)}
        >
            <option value="">All Classes</option>
            {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                    {cls.name}
                </option>
            ))}
        </select>
    );
};

export default ClassFilter;