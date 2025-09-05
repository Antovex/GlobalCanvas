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
    // gradeId: z.preprocess((v) => {
    //     if (v === "" || v == null) return undefined;
    //     return Number(v);
    // }, z.number().min(1, { message: "Grade is required!" })),
    supervisorId: z.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long!" })
        .max(20, { message: "Username must be at most 20 characters long!" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "First name is required!" }),
    surname: z.string().min(1, { message: "Last name is required!" }),
    email: z
        // .string()
        .email({ message: "Invalid email address!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: "Blood Type is required!" }),
    birthday: z.coerce.date({ message: "Birthday is required!" }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
    subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters long!" })
        .max(20, { message: "Username must be at most 20 characters long!" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "First name is required!" }),
    surname: z.string().min(1, { message: "Last name is required!" }),
    email: z
        // .string()
        .email({ message: "Invalid email address!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: "Blood Type is required!" }),
    birthday: z.coerce.date({ message: "Birthday is required!" }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
    // gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
    classId: z.coerce.number().min(1, { message: "Class is required!" }),
    parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const lessonSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: "Lesson name is required!" }),

    // Preferred (uncomment import above):
    // day: z.nativeEnum(Day, { required_error: "Day is required" }),

    // Fallback: replace values with your enum values if different
    day: z.enum(
        [
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY",
        ] as const,
        { message: "Day is required" }
    ),

    // Accepts ISO strings or Date objects (coerces to Date)
    startTime: z.coerce.date({ message: "Start time is required" }),
    endTime: z.coerce.date({ message: "End time is required" }),

    subjectId: z.coerce
        .number()
        .int()
        .min(1, { message: "Subject is required!" }),
    classId: z.coerce.number().int().min(1, { message: "Class is required!" }),
    teacherId: z.string().min(1, { message: "Teacher is required!" }),

    // optional relational arrays if needed
    // exams: z.array(z.number()).optional(),
    // assignments: z.array(z.number()).optional(),
    // attendances: z.array(z.number()).optional(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;
