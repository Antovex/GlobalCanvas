export const ITEM_PER_PAGE = 8;
export const DEFAULT_FEE_AMOUNT = 2750;

type RouteAccessMap = {
    [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
    // Broad role-based areas
    "/admin(.*)": ["admin"],
    "/student(.*)": ["student"],
    "/teacher(.*)": ["teacher"],
    "/parent(.*)": ["parent"],

    // Specific menu routes (keep exact paths to avoid accidental exposure)
    "/": ["admin", "teacher", "student", "parent"],
    "/list/teachers": ["admin", "teacher"],
    "/list/students": ["admin", "teacher"],
    "/list/parents": ["admin", "teacher"],
    "/list/subjects": ["admin"],
    "/list/classes": ["admin", "teacher"],
    "/list/lessons": ["admin", "teacher"],
    "/list/exams": ["admin", "teacher", "student", "parent"],
    "/list/assignments": ["admin", "teacher", "student", "parent"],
    "/list/results": ["admin", "teacher", "student", "parent"],
    "/list/attendance": ["admin", "teacher"],
    "/list/myattendance": ["parent", "student", "admin", "teacher"],
    "/list/teacher-attendance": ["admin"],
    "/list/teacher-attendance-history": ["admin", "teacher"],
    "/list/events": ["admin", "teacher", "student", "parent"],
    "/list/student-fees": ["admin"],
    "/list/announcements": ["admin", "teacher", "student", "parent"],
    "/list/supplies": ["admin"],

    // Optional / commented routes (keep in map in case you enable them)
    "/list/messages": ["admin", "teacher", "student", "parent"],
    "/profile": ["admin", "teacher", "student", "parent"],
    "/settings": ["admin", "teacher", "student", "parent"],
    "/logout": ["admin", "teacher", "student", "parent"],
};
