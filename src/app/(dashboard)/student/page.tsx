import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/util";

const StudentPage = async () => {
    const userId = await getCurrentUserId();

    const classItem = await prisma.class.findMany({
        where: {
            students: { some: { id: userId! } },
        },
    });

    const studentClass = classItem[0];

    if (!studentClass) {
        return (
            <div className="p-4">
                <div className="rounded-md bg-white p-4 text-sm text-gray-500">
                    No class assigned yet.
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex gap-4 flex-col xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3 min-h-[800px]">
                <div className="h-full bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Schedule ({studentClass.name})</h1>
                    <BigCalendarContainer type="classId" id={studentClass.id} />
                </div>
            </div>

            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-8">
                <EventCalendar />
                <Announcements />
            </div>
        </div>
    );
};

export default StudentPage;
