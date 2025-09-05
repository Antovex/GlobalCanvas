"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
    ClassSchema,
    StudentSchema,
    SubjectSchema,
    TeacherSchema,
} from "./formValidationSchemas";
import { prisma } from "./prisma";
import { getUserRole } from "./util";

type CurrentState = { success: boolean; error: boolean };

// parseId: accepts FormData-like objects or plain objects/values and returns a number or null
const parseforId = (data: any): number | null => {
    if (data == null) return null;

    // FormData or FormData-like (has .get)
    if (typeof data.get === "function") {
        const v = data.get("id") ?? data.get("Id") ?? data.get("ID");
        if (v == null) return null;
        return Number(v);
    }

    // plain object (server actions may receive a POJO)
    if (typeof data === "object") {
        const v = (data as any).id ?? (data as any).Id ?? (data as any).ID;
        if (v == null) return null;
        return Number(v);
    }

    // fallback (primitive)
    const n = Number(data);
    return Number.isFinite(n) ? n : null;
};

export const createSubject = async (
    currentState: CurrentState,
    data: SubjectSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can create subject...");
        return { success: false, error: true };
    }
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                teachers: {
                    connect: data.teachers.map((teacherId) => ({
                        id: teacherId,
                    })),
                },
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.error("Error creating subject:", err);
        return { success: false, error: true };
    }
};

export const updateSubject = async (
    currentState: CurrentState,
    data: SubjectSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can update subject...");
        return { success: false, error: true };
    }
    try {
        // ensure id is present and is a number
        const id = Number((data as any).id);
        if (!Number.isFinite(id as number)) {
            console.error("updateSubject: missing or invalid id", id);
            return { success: false, error: true };
        }

        await prisma.subject.update({
            where: {
                id,
            },
            data: {
                name: data.name,
                teachers: {
                    set: data.teachers.map((teacherId) => ({ id: teacherId })),
                },
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.error(err);
        return { success: false, error: true };
    }
};

export const deleteSubject = async (
    currentState: CurrentState,
    data: FormData | any
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can delete subject...");
        return { success: false, error: true };
    }
    try {
        const id = parseforId(data);
        if (!Number.isFinite(id as number)) {
            console.error("deleteSubject: missing or invalid id", id);
            return { success: false, error: true };
        }

        await prisma.subject.delete({
            where: {
                id: id as number,
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const createClass = async (
    currentState: CurrentState,
    data: ClassSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can create class...");
        return { success: false, error: true };
    }
    try {
        await prisma.class.create({
            data,
        });

        // revalidatePath("/list/class");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const updateClass = async (
    currentState: CurrentState,
    data: ClassSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can update class...");
        return { success: false, error: true };
    }
    try {
        if (typeof data.id !== "number" || !Number.isFinite(data.id)) {
            console.error("updateClass: missing or invalid id", data.id);
            return { success: false, error: true };
        }

        await prisma.class.update({
            where: {
                id: data.id,
            },
            data,
        });

        // revalidatePath("/list/class");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const deleteClass = async (
    currentState: CurrentState,
    data: FormData
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can delete class...");
        return { success: false, error: true };
    }
    const id = data.get("id") as string;
    try {
        await prisma.class.delete({
            where: {
                id: parseInt(id),
            },
        });

        // revalidatePath("/list/class");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const createTeacher = async (
    currentState: CurrentState,
    data: TeacherSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can create teachers...");
        return { success: false, error: true };
    }
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        await prisma.teacher.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday,
                subjects: {
                    connect: data.subjects?.map((subjectId: string) => ({
                        id: parseInt(subjectId),
                    })),
                },
            },
        });

        // revalidatePath("/list/teachers");
        return { success: true, error: false };
    } catch (err: any) {
        console.error(
            "Clerk createUser error:",
            JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        );
        if (err?.errors)
            console.error("Clerk errors:", JSON.stringify(err.errors, null, 2));
        // helpful hint log
        console.error(
            "Clerk trace id (check Clerk dashboard):",
            err?.clerkTraceId
        );
        return { success: false, error: true };
    }
};

export const updateTeacher = async (
    currentState: CurrentState,
    data: TeacherSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can update teachers...");
        return { success: false, error: true };
    }
    if (!data.id) {
        return { success: false, error: true };
    }
    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        await prisma.teacher.update({
            where: {
                id: user.id,
            },
            data: {
                ...(data.password !== "" && { password: data.password }),
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday,
                subjects: {
                    set: data.subjects?.map((subjectId: string) => ({
                        id: parseInt(subjectId),
                    })),
                },
            },
        });
        // revalidatePath("/list/teachers");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const deleteTeacher = async (
    currentState: CurrentState,
    data: FormData
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can delete teachers...");
        return { success: false, error: true };
    }
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.teacher.delete({
            where: {
                id: id,
            },
        });

        // revalidatePath("/list/teachers");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const createStudent = async (
    currentState: CurrentState,
    data: StudentSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can create students...");
        return { success: false, error: true };
    }
    // console.log(data);
    try {
        const classItem = await prisma.class.findUnique({
            where: { id: data.classId },
            include: { _count: { select: { students: true } } },
        });

        if (classItem && classItem.capacity === classItem._count.students) {
            return { success: false, error: true };
        }

        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" },
        });

        await prisma.student.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday,
                // gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            },
        });

        // revalidatePath("/list/students");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const updateStudent = async (
    currentState: CurrentState,
    data: StudentSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can update student...");
        return { success: false, error: true };
    }
    if (!data.id) {
        return { success: false, error: true };
    }
    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        await prisma.student.update({
            where: {
                id: user.id,
            },
            data: {
                ...(data.password !== "" && { password: data.password }),
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: data.birthday,
                // gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            },
        });
        // revalidatePath("/list/students");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const deleteStudent = async (
    currentState: CurrentState,
    data: FormData
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can delete student...");
        return { success: false, error: true };
    }
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.student.delete({
            where: {
                id: id,
            },
        });

        // revalidatePath("/list/students");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};
