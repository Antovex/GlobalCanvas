"use server";

import { clerkClient } from "@clerk/nextjs/server";
import {
    ClassSchema,
    StudentSchema,
    SubjectSchema,
    TeacherSchema,
    LessonSchema,
    ParentSchema
} from "./formValidationSchemas";
import { prisma } from "./prisma";
import { getUserRole } from "./util";
import { revalidatePath } from "next/cache";

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
    
    try {
        const classItem = await prisma.class.findUnique({
            where: { id: data.classId },
            include: { _count: { select: { students: true } } },
        });

        if (classItem && classItem.capacity <= classItem._count.students) {
            // Using a more specific error message would be better here
            return { success: false, error: true };
        }

        const client = await clerkClient();
        let finalParentId = data.parentId;

        // Transaction to ensure both parent and student are created, or neither
        await prisma.$transaction(async (tx) => {
            // Scenario 1: Create a new parent
            if (data.parentId === 'new') {
                if (!data.parentUsername || !data.parentPassword || !data.parentName || !data.parentSurname || !data.parentAddress) {
                    throw new Error("Missing required fields for new parent.");
                }

                const parentUser = await client.users.createUser({
                    username: data.parentUsername,
                    password: data.parentPassword,
                    firstName: data.parentName,
                    lastName: data.parentSurname,
                    ...(data.parentEmail
                        ? { emailAddresses: [{ emailAddress: data.parentEmail }] }
                        : {}),
                    publicMetadata: { role: "parent" },
                });

                const newParent = await tx.parent.create({
                    data: {
                        id: parentUser.id,
                        username: data.parentUsername,
                        name: data.parentName,
                        surname: data.parentSurname,
                        email: data.parentEmail || null,
                        phone: data.parentPhone || "-",
                        address: data.parentAddress,
                    },
                });
                finalParentId = newParent.id;
            }

            // Create the student user in Clerk
            const studentUser = await client.users.createUser({
                username: data.username,
                password: data.password,
                firstName: data.name,
                lastName: data.surname,
                publicMetadata: { role: "student" },
            });

            // Create the student in the database, linked to the parent
            await tx.student.create({
                data: {
                    id: studentUser.id,
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
                    classId: data.classId,
                    parentId: finalParentId, // Use the determined parent ID
                },
            });
        });

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

export const createLesson = async (
    currentState: CurrentState,
    data: LessonSchema
) => {
    const role = await getUserRole();
    if (role !== "admin" && role !== "teacher") {
        console.log("Only admins or teachers can create lessons...");
        return { success: false, error: true };
    }
    try {
        await prisma.lesson.create({
            data: {
                name: data.name,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId: data.teacherId,
            },
        });

        // revalidatePath("/list/lessons");
        return { success: true, error: false };
    } catch (err) {
        console.log("createLesson error:", err);
        return { success: false, error: true };
    }
};

export const updateLesson = async (
    currentState: CurrentState,
    data: LessonSchema
) => {
    const role = await getUserRole();
    if (role !== "admin" && role !== "teacher") {
        console.log("Only admins or teachers can update lessons...");
        return { success: false, error: true };
    }
    if (typeof (data as any).id !== "number" || !Number.isFinite((data as any).id)) {
        console.error("updateLesson: missing or invalid id", (data as any).id);
        return { success: false, error: true };
    }
    try {
        const id = (data as any).id as number;
        await prisma.lesson.update({
            where: { id },
            data: {
                name: data.name,
                day: data.day,
                startTime: data.startTime,
                endTime: data.endTime,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId: data.teacherId,
            },
        });

        // revalidatePath("/list/lessons");
        return { success: true, error: false };
    } catch (err) {
        console.log("updateLesson error:", err);
        return { success: false, error: true };
    }
};

export const deleteLesson = async (
    currentState: CurrentState,
    data: FormData | any
) => {
    const role = await getUserRole();
    if (role !== "admin" && role !== "teacher") {
        console.log("Only admins or teachers can delete lessons...");
        return { success: false, error: true };
    }
    try {
        const id = parseforId(data);
        if (!Number.isFinite(id as number)) {
            console.error("deleteLesson: missing or invalid id", id);
            return { success: false, error: true };
        }

        await prisma.lesson.delete({
            where: { id: id as number },
        });

        // revalidatePath("/list/lessons");
        return { success: true, error: false };
    } catch (err) {
        console.log("deleteLesson error:", err);
        return { success: false, error: true };
    }
};

export async function createSupply(formData: FormData) {
    const role = await getUserRole();
    
    if (role !== "admin") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const quantity = parseInt(formData.get("quantity") as string) || 0;

    if (!name || name.trim() === "") {
        throw new Error("Supply name is required");
    }

    try {
        await prisma.supply.create({
            data: {
                name: name.trim(),
                quantity,
            },
        });

        revalidatePath("/list/supplies");
        return { success: true };
    } catch (error) {
        throw new Error("Failed to create supply");
    }
}

export async function updateSupplyQuantity(id: number, change: number) {
    const role = await getUserRole();
    
    if (role !== "admin") {
        throw new Error("Unauthorized");
    }

    try {
        const supply = await prisma.supply.findUnique({
            where: { id },
        });

        if (!supply) {
            throw new Error("Supply not found");
        }

        const newQuantity = Math.max(0, supply.quantity + change);

        await prisma.supply.update({
            where: { id },
            data: { quantity: newQuantity },
        });

        revalidatePath("/list/supplies");
        return { success: true };
    } catch (error) {
        throw new Error("Failed to update supply quantity");
    }
}

export async function deleteSupply(id: number) {
    const role = await getUserRole();
    
    if (role !== "admin") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.supply.delete({
            where: { id },
        });

        revalidatePath("/list/supplies");
        return { success: true };
    } catch (error) {
        throw new Error("Failed to delete supply");
    }
}

export const createParent = async (
    currentState: CurrentState,
    data: ParentSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        console.log("Only admins can create parents...");
        return { success: false, error: true };
    }
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "parent" },
        });

        await prisma.parent.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || "-",
                address: data.address,
            },
        });

        return { success: true, error: false };
    } catch (err) {
        console.error("Error creating parent:", err);
        return { success: false, error: true };
    }
};

export const updateParent = async (
    currentState: CurrentState,
    data: ParentSchema
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        return { success: false, error: true };
    }
    if (!data.id) {
        return { success: false, error: true };
    }
    try {
        const client = await clerkClient();
        await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        await prisma.parent.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || "-",
                address: data.address,
            },
        });
        return { success: true, error: false };
    } catch (err) {
        console.error("Error updating parent:", err);
        return { success: false, error: true };
    }
};

export const deleteParent = async (
    currentState: CurrentState,
    data: FormData
) => {
    const role = await getUserRole();
    if (role !== "admin") {
        return { success: false, error: true };
    }
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        await client.users.deleteUser(id);

        await prisma.parent.delete({
            where: { id },
        });

        return { success: true, error: false };
    } catch (err) {
        console.error("Error deleting parent:", err);
        return { success: false, error: true };
    }
};