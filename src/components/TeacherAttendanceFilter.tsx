"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";

type TeacherAttendanceFilterProps = {
    teachers?: {
        id: string;
        name: string;
        surname: string;
    }[];
    showTeacherSelect?: boolean;
};

const TeacherAttendanceFilter = ({ teachers = [], showTeacherSelect = false }: TeacherAttendanceFilterProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [fromDate, setFromDate] = useState(searchParams.get("from") || "");
    const [toDate, setToDate] = useState(searchParams.get("to") || "");

    const updateParams = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete("page"); // Reset to first page
        
        router.push(`${pathname}?${params.toString()}`);
    };

    const applyDateFilter = () => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (fromDate) {
            params.set("from", fromDate);
        } else {
            params.delete("from");
        }
        
        if (toDate) {
            params.set("to", toDate);
        } else {
            params.delete("to");
        }
        
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setFromDate("");
        setToDate("");
        router.push(pathname);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-md">
            {/* Date Range */}
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                />
            </div>
            
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                />
            </div>

            {/* Teacher Select (Admin only) */}
            {showTeacherSelect && teachers.length > 0 && (
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Teacher:</label>
                    <select
                        className="px-3 py-2 border rounded-md text-sm"
                        value={searchParams.get("teacherId") || ""}
                        onChange={(e) => updateParams("teacherId", e.target.value)}
                    >
                        <option value="">All Teachers</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name} {teacher.surname}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={applyDateFilter}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                    Apply
                </button>
                <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default TeacherAttendanceFilter;