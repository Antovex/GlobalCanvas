"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";

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
    const [view, setView] = useState<View>(Views.WEEK);

    const lessons = (data || []).map((e) => ({
        title: e.title,
        start: typeof e.start === "string" ? new Date(e.start) : e.start,
        end: typeof e.end === "string" ? new Date(e.end) : e.end,
    }));

    // useEffect(() => {
    //     console.log("BigCalendar lessons (client):", lessons);
    // }, [lessons]);

    const today = new Date();
    
    // prefer a lesson that is on today, otherwise fall back to first lesson, otherwise today
    // const lessonOnToday = lessons.find((ev) => isSameDay(new Date(ev.start), today));
    // const baseDateRaw = lessonOnToday ? new Date(lessonOnToday.start) : lessons[0]?.start ? new Date(lessons[0].start) : today;
    // const baseDate = new Date(baseDateRaw);

    const getBaseDate = () => {
        const lessonOnToday = lessons.find((ev) => isSameDay(new Date(ev.start), today));
        if (lessonOnToday) {
            return new Date(lessonOnToday.start);
        }
        if (lessons[0]?.start) {
            return new Date(lessons[0].start);
        }
        return today;
    };

    const baseDate = getBaseDate();
    baseDate.setHours(0, 0, 0, 0);

    return (
        <div style={{ height: 600 }} className="w-full">
            <Calendar
                localizer={localizer}
                events={lessons}
                startAccessor="start"
                endAccessor="end"
                views={[Views.DAY, Views.WEEK]} //, Views.WORK_WEEK
                view={view}
                defaultView={Views.DAY}
                defaultDate={baseDate}
                style={{ height: "100%" }}
                onView={(v: View) => setView(v)}
                showMultiDayTimes
            />
        </div>
    );
};

export default BigCalendar;
