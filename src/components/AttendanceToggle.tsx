"use client";

import React, { useState, useEffect } from "react";

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

    // keep internal state in sync when the server-provided initial changes (e.g. date changed)
    useEffect(() => {
        setStatus(initial ?? null);
    }, [initial]);

    async function mark(s: Status) {
        if (loading) return;
        setLoading(true);
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
            setLoading(false);
        }
    }

    const btn = (s: Status, label: string, cls = "") => {
        const isSelected = status === s;
        const selectedBg =
            s === "PRESENT" ? "#cfceff" : s === "ABSENT" ? "#fae27c" : "#e53d30";
        const textColor = isSelected
            ? s === "COMPENSATION"
                ? "#ffffff"
                : "#111827"
            : undefined;

        const baseClass =
            "w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center";
        const selectedClass = isSelected ? "ring-2 ring-offset-1" : "bg-gray-100 text-gray-700 hover:bg-gray-200";
        const loadingClass = loading && isSelected ? " opacity-70 cursor-wait" : "";

        return (
            <button
                key={s}
                type="button"
                onClick={() => mark(s)}
                aria-pressed={isSelected}
                className={`${baseClass} ${selectedClass} ${loadingClass} ${cls}`}
                style={
                    isSelected
                        ? { backgroundColor: selectedBg, color: textColor }
                        : undefined
                }
            >
                {label}
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