import { cache } from "react";
import {
    classesData,
    lessonsData,
    parentsData,
    studentsData,
    subjectsData,
    teachersData,
} from "./data";
import { prisma } from "./prisma";
import { DEMO_DATA_ENABLED, ITEM_PER_PAGE } from "./settings";

type Supervisor = { name: string; surname: string } | null;
type PersonName = { name: string; surname: string };

export type DemoStudentList = {
    id: string;
    name: string;
    img: string | null;
    phone: string | null;
    address: string;
    class: { name: string };
};

export type DemoTeacherList = {
    id: string;
    name: string;
    img: string | null;
    email: string | null;
    phone: string | null;
    address: string;
    subjects: { name: string }[];
    classes: { name: string }[];
};

export type DemoParentList = {
    id: string;
    name: string;
    surname: string;
    email: string | null;
    phone: string | null;
    address: string;
    students: PersonName[];
};

export type DemoClassList = {
    id: number;
    name: string;
    capacity: number;
    supervisor: Supervisor;
};

export type DemoSubjectList = {
    id: number;
    name: string;
    teachers: PersonName[];
};

export type DemoLessonList = {
    id: number;
    subject: { name: string };
    class: { name: string };
    teacher: PersonName;
};

const toWords = (value: string) => value.trim().split(/\s+/).filter(Boolean);

const toPersonName = (fullName: string): PersonName => {
    const words = toWords(fullName);
    if (words.length <= 1) {
        return { name: fullName.trim(), surname: "" };
    }
    return {
        name: words[0],
        surname: words.slice(1).join(" "),
    };
};

const paginate = <T>(items: T[], page: number) => {
    const start = ITEM_PER_PAGE * (page - 1);
    return items.slice(start, start + ITEM_PER_PAGE);
};

const includesSearch = (value: string, search?: string) => {
    if (!search) return true;
    return value.toLowerCase().includes(search.toLowerCase());
};

const isCoreDatabaseEmpty = cache(async (): Promise<boolean> => {
    if (!DEMO_DATA_ENABLED) return false;

    try {
        const [
            studentCount,
            teacherCount,
            parentCount,
            classCount,
            subjectCount,
            lessonCount,
        ] = await prisma.$transaction([
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.parent.count(),
            prisma.class.count(),
            prisma.subject.count(),
            prisma.lesson.count(),
        ]);

        return (
            studentCount === 0 &&
            teacherCount === 0 &&
            parentCount === 0 &&
            classCount === 0 &&
            subjectCount === 0 &&
            lessonCount === 0
        );
    } catch {
        return false;
    }
});

export const shouldUseDemoData = async () => isCoreDatabaseEmpty();

export const getDemoStudents = (page: number, search?: string) => {
    const filtered = studentsData.filter((student) =>
        includesSearch(student.name, search)
    );

    const data: DemoStudentList[] = paginate(filtered, page).map((student) => ({
        id: `demo-student-${student.id}`,
        name: student.name,
        img: student.photo ?? null,
        phone: student.phone ?? null,
        address: student.address,
        class: { name: student.class },
    }));

    return { data, count: filtered.length };
};

export const getDemoTeachers = (page: number, search?: string) => {
    const filtered = teachersData.filter((teacher) =>
        includesSearch(teacher.name, search)
    );

    const data: DemoTeacherList[] = paginate(filtered, page).map((teacher) => ({
        id: `demo-teacher-${teacher.id}`,
        name: teacher.name,
        img: teacher.photo ?? null,
        email: teacher.email ?? null,
        phone: teacher.phone ?? null,
        address: teacher.address,
        subjects: teacher.subjects.map((subject) => ({ name: subject })),
        classes: teacher.classes.map((className) => ({ name: className })),
    }));

    return { data, count: filtered.length };
};

export const getDemoParents = (page: number, search?: string) => {
    const filtered = parentsData.filter((parent) =>
        includesSearch(parent.name, search)
    );

    const data: DemoParentList[] = paginate(filtered, page).map((parent) => {
        const parentName = toPersonName(parent.name);
        return {
            id: `demo-parent-${parent.id}`,
            name: parentName.name,
            surname: parentName.surname,
            email: parent.email ?? null,
            phone: parent.phone ?? null,
            address: parent.address,
            students: parent.students.map((studentName) =>
                toPersonName(studentName)
            ),
        };
    });

    return { data, count: filtered.length };
};

export const getDemoClasses = (page: number, search?: string) => {
    const filtered = classesData.filter((classItem) =>
        includesSearch(classItem.name, search)
    );

    const data: DemoClassList[] = paginate(filtered, page).map((classItem) => ({
        id: classItem.id,
        name: classItem.name,
        capacity: classItem.capacity,
        supervisor: classItem.supervisor
            ? toPersonName(classItem.supervisor)
            : null,
    }));

    return { data, count: filtered.length };
};

export const getDemoSubjects = (page: number, search?: string) => {
    const filtered = subjectsData.filter((subject) =>
        includesSearch(subject.name, search)
    );

    const data: DemoSubjectList[] = paginate(filtered, page).map((subject) => ({
        id: subject.id,
        name: subject.name,
        teachers: subject.teachers.map((teacherName) =>
            toPersonName(teacherName)
        ),
    }));

    return { data, count: filtered.length };
};

export const getDemoLessons = (page: number, search?: string) => {
    const filtered = lessonsData.filter(
        (lesson) =>
            includesSearch(lesson.subject, search) ||
            includesSearch(lesson.teacher, search)
    );

    const data: DemoLessonList[] = paginate(filtered, page).map((lesson) => ({
        id: lesson.id,
        subject: { name: lesson.subject },
        class: { name: lesson.class },
        teacher: toPersonName(lesson.teacher),
    }));

    return { data, count: filtered.length };
};
