import { z } from "zod";

export const subjectSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Class name is required!" }),
    teachers: z.array(z.string()),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Subject name is required!" }),
    capacity: z.preprocess((v) => {
        if (v === "" || v == null) return undefined;
        return Number(v);
    }, z.number().min(1, { message: "Capacity is required!" })),
    gradeId: z.preprocess((v) => {
        if (v === "" || v == null) return undefined;
        return Number(v);
    }, z.number().min(1, { message: "Grade is required!" })),
    supervisorId: z.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;
