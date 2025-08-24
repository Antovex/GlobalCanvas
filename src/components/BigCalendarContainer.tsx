import { prisma } from "@/lib/prisma";
import BigCalendar from "./BigCalendar";
import { adjustScheduleToCurrentWeek } from "@/lib/util";

const BigCalendarContainer = async ({
    type,
    id,
}: {
    type: "teacherId" | "classId";
    id: string | number;
}) => {
    const dataRes = await prisma.lesson.findMany({
        where: {
            ...(type === "teacherId"
                ? { teacherId: id as string }
                : { classId: id as number }),
        },
    });

    // console.log(
    //     "BigCalendarContainer -> dataRes before data mapping:",
    //     dataRes
    // );

    const data = dataRes
        .map((lesson) => ({
            title: lesson.name,
            start: lesson.startTime,
            end: lesson.endTime,
        }))
        .sort(
            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        );

    // console.log("BigCalendarContainer -> data before schedule:", data);

    const schedule = adjustScheduleToCurrentWeek(data);

    // console.log("BigCalendarContainer -> schedule before send:", schedule);

    return (
        <div className="">
            <BigCalendar data={schedule} />
        </div>
    );
};

export default BigCalendarContainer;
