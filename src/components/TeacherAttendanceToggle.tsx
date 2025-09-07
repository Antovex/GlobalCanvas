"use client";

import React, { useState, useEffect, useRef } from "react";

type TeacherAttendanceToggleProps = {
    teacherId: string;
    date?: string;
    initial?: boolean | null;
};

const TeacherAttendanceToggle = ({
    teacherId,
    date,
    initial,
}: TeacherAttendanceToggleProps) => {
    const [present, setPresent] = useState<boolean | null>(initial || null);
    const [loading, setLoading] = useState(false);
    // which status is currently being submitted (shows per-button submitting state)
    const [submittingStatus, setSubmittingStatus] = useState<boolean | null>(null);
    // ref to prevent race conditions from rapid clicks (state updates are async)
    const submittingRef = useRef(false);

    // keep internal state in sync when the server-provided initial changes (e.g. date changed)
    useEffect(() => {
        setPresent(initial ?? null);
    }, [initial]);

    async function mark(presentStatus: boolean) {
        // guard using ref so rapid clicks cannot start multiple requests
        if (submittingRef.current) return;
        submittingRef.current = true;
        setLoading(true);
        setSubmittingStatus(presentStatus);

        try {
            const response = await fetch("/api/teacher-attendances", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    teacherId,
                    present: presentStatus,
                    date: date || new Date().toISOString(),
                }),
            });

            if (response.ok) {
                setPresent(presentStatus);
            } else {
                console.error("Teacher attendance save failed", await response.text());
            }
        } catch (error) {
            console.error("Error updating teacher attendance:", error);
        } finally {
            submittingRef.current = false;
            setLoading(false);
            setSubmittingStatus(null);
        }
    }

    const spinner = React.useMemo(
        () => (
            <svg className="animate-spin inline-block" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
        ),
        []
    );

    const btn = (presentStatus: boolean, label: string, cls = "") => {
        const isSelected = present === presentStatus;
        const isSubmittingThis = submittingStatus === presentStatus;
        const selectedBg = presentStatus ? "#cfceff" : "#e53d30";
        const textColor = isSelected
            ? presentStatus
                ? "#111827"
                : "#ffffff"
            : undefined;

        const baseClass =
            "w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center";
        const selectedClass = isSelected ? "ring-2 ring-offset-1" : "bg-gray-100 text-gray-700 hover:bg-gray-200";
        // disable while any submit is in flight
        const disabled = submittingRef.current;

        return (
            <button
                key={String(presentStatus)}
                type="button"
                onClick={() => !disabled && mark(presentStatus)}
                aria-pressed={isSelected}
                aria-busy={isSubmittingThis}
                disabled={disabled}
                className={`${baseClass} ${selectedClass} ${cls} ${disabled ? "opacity-70 cursor-wait" : ""}`}
                style={
                    isSelected
                        ? { backgroundColor: selectedBg, color: textColor }
                        : undefined
                }
            >
                {isSubmittingThis ? spinner : label}
            </button>
        );
    };

    return (
        <div className="flex items-center gap-2">
            {btn(true, "P")}
            {btn(false, "A")}
        </div>
    );
};

export default TeacherAttendanceToggle;