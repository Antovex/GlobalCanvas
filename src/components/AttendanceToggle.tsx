"use client";

import React, { useState, useEffect, useRef } from "react";

type Status = "PRESENT" | "ABSENT" | "COMPENSATION";

type Props = {
    studentId: string;
    lessonId?: number | null;
    classId?: number | null;
    initial?: Status | null;
    date?: string | null; // ISO date string (server will parse) or null to use default
};

export default function AttendanceToggle({ studentId, lessonId = null, initial = null, date = null }: Props) {
    const [status, setStatus] = useState<Status | null>(initial);
    const [loading, setLoading] = useState(false);
    // which status is currently being submitted (shows per-button submitting state)
    const [submittingStatus, setSubmittingStatus] = useState<Status | null>(null);
    // ref to prevent race conditions from rapid clicks (state updates are async)
    const submittingRef = useRef(false);

    // keep internal state in sync when the server-provided initial changes (e.g. date changed)
    useEffect(() => {
        setStatus(initial ?? null);
    }, [initial]);

    async function mark(s: Status) {
        // guard using ref so rapid clicks cannot start multiple requests
        if (submittingRef.current) return;
        submittingRef.current = true;
        setLoading(true);
        setSubmittingStatus(s);

        try {
            const payload: any = { studentId, lessonId, status: s };
            if (date) payload.date = date; // include chosen date
            const res = await fetch("/api/attendances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setStatus(s);
            } else {
                console.error("attendance save failed", await res.text());
            }
        } catch (err) {
            console.error(err);
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

    const btn = (s: Status, label: string, cls = "") => {
        const isSelected = status === s;
        const isSubmittingThis = submittingStatus === s;
        const selectedBg =
            s === "PRESENT" ? "#cfceff" : s === "ABSENT" ? "#e53d30" : "#fae27c";
        const textColor = isSelected
            ? s === "ABSENT"
                ? "#ffffff"
                : "#111827"
            : undefined;

        const baseClass =
            "w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center";
        const selectedClass = isSelected ? "ring-2 ring-offset-1" : "bg-gray-100 text-gray-700 hover:bg-gray-200";
        // disable while any submit is in flight
        const disabled = submittingRef.current;

        return (
            <button
                key={s}
                type="button"
                onClick={() => !disabled && mark(s)}
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
            {btn("PRESENT", "P")}
            {btn("COMPENSATION", "C")}
            {btn("ABSENT", "A")}
        </div>
    );
}