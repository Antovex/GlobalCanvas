import { auth } from "@clerk/nextjs/server";

export async function getUserRole(): Promise<string> {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    // Validate role against allowed roles
    const allowedRoles = ["admin", "teacher", "student", "parent"];
    if (typeof role === "string" && allowedRoles.includes(role)) {
        return role;
    }
    return "norole";
}

export async function getCurrentUserId(): Promise<string> {
    const { userId } = await auth();
    if (userId) {
        return userId;
    }
    throw new Error(
        "User is not authenticated or user ID could not be retrieved from Clerk."
    );
}

/**
 * Return the most recent Sunday (start of current week, inclusive).
 */
export const getLatestSunday = (): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const latestSunday = new Date(today);
    latestSunday.setDate(today.getDate() - dayOfWeek);
    latestSunday.setHours(0, 0, 0, 0);
    // latestSunday.setMilliseconds(0);
    return latestSunday;
};

/**
 * Map weekly-template lessons (only weekday/time) to concrete dates in the current week
 * where week runs Sunday -> Saturday.
 */
export const adjustScheduleToCurrentWeek = (
    lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
    const weekStart = getLatestSunday(); // Sunday of this week

    return lessons.map((lesson) => {
        // lesson.start.getDay() is 0..6 (Sunday..Saturday)
        const lessonDay = lesson.start.getDay();

        // build adjustedStart on the week's Sunday + lessonDay, preserve time-of-day
        const adjustedStart = new Date(weekStart);
        adjustedStart.setDate(weekStart.getDate() + lessonDay);
        adjustedStart.setHours(
            lesson.start.getHours(),
            lesson.start.getMinutes(),
            lesson.start.getSeconds(),
            lesson.start.getMilliseconds()
        );

        // compute duration in ms and apply to adjustedStart to get adjustedEnd
        const durationMs = lesson.end.getTime() - lesson.start.getTime();
        const adjustedEnd = new Date(adjustedStart.getTime() + durationMs);

        return {
            title: lesson.title,
            start: adjustedStart,
            end: adjustedEnd,
        };
    });
};
