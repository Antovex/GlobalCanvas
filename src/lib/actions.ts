"use server";

import { ClassSchema, SubjectSchema } from "./formValidationSchemas";
import { prisma } from "./prisma";

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
