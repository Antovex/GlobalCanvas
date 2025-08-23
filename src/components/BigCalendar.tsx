"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState, useMemo } from "react";

const localizer = momentLocalizer(moment);

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const BigCalendar = ({
    data,
}: {
    data: { title: string; start: string | Date; end: string | Date }[];
}) => {
    const [view, setView] = useState<View>(Views.DAY);

    const lessons = (data || []).map((e) => ({
        title: e.title,
        start: typeof e.start === "string" ? new Date(e.start) : e.start,
        end: typeof e.end === "string" ? new Date(e.end) : e.end,
    }));

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const getBaseDate = () => {
        const lessonOnToday = lessons.find((ev) => isSameDay(new Date(ev.start), today));
        if (lessonOnToday) return new Date(lessonOnToday.start);
        if (lessons[0]?.start) return new Date(lessons[0].start);
        return new Date();
    };

    
    const baseDate = getBaseDate();
    baseDate.setHours(0, 0, 0, 0);

    // controlled current date shown in calendar
    const [currentDate, setCurrentDate] = useState<Date>(baseDate);

    // when lessons change, keep calendar focused sensibly (prefer today if lesson exists today)
    useEffect(() => {
        const lessonOnToday = lessons.find((ev) => isSameDay(new Date(ev.start), new Date()));
        if (lessonOnToday) {
            const d = new Date(lessonOnToday.start);
            d.setHours(0, 0, 0, 0);
            setCurrentDate(d);
        } else if (lessons[0]?.start) {
            const d = new Date(lessons[0].start);
            d.setHours(0, 0, 0, 0);
            setCurrentDate(d);
        } else {
            setCurrentDate(today);
        }
    }, [lessons, today]); // run when lessons or today changes
    // [data?.length]

    const handleView = (v: View) => {
        setView(v);
        if (v === Views.DAY) {
            // when switching to Day view, show today's date explicitly
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            setCurrentDate(d);
        }
    };

    const handleNavigate = (date: Date) => {
        // keep controlled date in sync when user navigates
        setCurrentDate(date);
    };

    return (
        <div className="w-full min-h-[800px]">
            {/* style={{ height: 600 }} */}
            <Calendar
                localizer={localizer}
                events={lessons}
                startAccessor="start"
                endAccessor="end"
                views={[Views.DAY, Views.WEEK]}
                view={view}
                date={currentDate}
                defaultView={Views.DAY}
                style={{ height: "100%" }}
                onView={handleView}
                onNavigate={handleNavigate}
                showMultiDayTimes
            />
        </div>
    );
};

export default BigCalendar;
