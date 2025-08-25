"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function AttendanceDatePicker({ initialDate }: { initialDate?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const today = new Date();
    
    // Convert string date to Date object
    const getInitialDate = () => {
        if (initialDate) return new Date(initialDate);
        const dateParam = searchParams?.get("date");
        if (dateParam) return new Date(dateParam);
        return today;
    };
    
    const [value, setValue] = useState<Value>(getInitialDate());
    const [showCalendar, setShowCalendar] = useState(false);

    // Helper function to format date in local timezone
    const formatDateToLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    function updateDate(newValue: Value) {
        setValue(newValue);
        if (newValue instanceof Date) {
            const dateString = formatDateToLocal(newValue);
            const params = new URLSearchParams(Object.fromEntries(Array.from(searchParams?.entries() || [])));
            params.set("date", dateString);
            params.delete("page"); // reset page param when changing date
            router.push(`${pathname}?${params.toString()}`);
            setShowCalendar(false); // Close calendar after selection
        }
    }

    const formatDisplayDate = (date: Value) => {
        if (date instanceof Date) {
            return formatDateToLocal(date);
        }
        return '';
    };

    return (
        <div className="flex items-center gap-2 relative">
            <label className="text-sm text-gray-600">Date:</label>
            <div className="relative">
                <input
                    type="text"
                    value={formatDisplayDate(value)}
                    onClick={() => setShowCalendar(!showCalendar)}
                    readOnly
                    className="px-2 py-1 rounded-md border text-sm cursor-pointer bg-white min-w-[8rem] text-center"
                    aria-label="Select attendance date"
                    placeholder="Select date"
                />
                {showCalendar && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
                        <Calendar
                            onChange={updateDate}
                            value={value}
                            calendarType="iso8601" // Monday as first day of the week
                            className="border-0"
                        />
                    </div>
                )}
            </div>
            {showCalendar && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCalendar(false)}
                />
            )}
        </div>
    );
}