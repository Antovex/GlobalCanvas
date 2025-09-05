"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, type LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import {
    Dispatch,
    SetStateAction,
    startTransition,
    useActionState,
    useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const DAY_OPTIONS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
] as const;

const LessonForm = ({
    setOpen,
    type,
    data,
    relatedData,
}: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: "create" | "update";
    data?: any;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema) as Resolver<LessonSchema>,
        defaultValues: {
            name: data?.name,
            day: data?.day,
            startTime: data?.startTime ? new Date(data.startTime) : undefined,
            endTime: data?.endTime ? new Date(data.endTime) : undefined,
            subjectId: data?.subjectId,
            classId: data?.classId,
            teacherId: data?.teacherId,
            id: data?.id,
        },
    });

    const [state, formAction] = useActionState(
        type === "create" ? createLesson : updateLesson,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((d) => {
        if (data?.id) d.id = data.id;
        startTransition(() => {
            formAction(d);
        });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(
                `Lesson has been ${type === "create" ? "created" : "updated"}!`
            );
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { subjects = [], classes = [], teachers = [] } = relatedData ?? {};

    // helper to format date for datetime-local defaultValue
    const toDateTimeLocal = (d?: string | Date) =>
        d ? new Date(d).toISOString().slice(0, 16) : undefined;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create"
                    ? "Create a new lesson"
                    : "Update the lesson"}
            </h1>

            <div className="flex flex-wrap gap-4">
                <InputField
                    label="Lesson name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors?.name}
                />

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Day</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("day")}
                        defaultValue={data?.day}
                    >
                        {DAY_OPTIONS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                    {errors.day && (
                        <p className="text-xs text-red-400">
                            {errors.day.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Start time</label>
                    <input
                        type="datetime-local"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("startTime")}
                        defaultValue={toDateTimeLocal(data?.startTime)}
                    />
                    {errors.startTime && (
                        <p className="text-xs text-red-400">
                            {errors.startTime.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">End time</label>
                    <input
                        type="datetime-local"
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("endTime")}
                        defaultValue={toDateTimeLocal(data?.endTime)}
                    />
                    {errors.endTime && (
                        <p className="text-xs text-red-400">
                            {errors.endTime.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Subject</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjectId")}
                        defaultValue={data?.subjectId?.toString()}
                    >
                        <option value="">Select subject</option>
                        {subjects.map((s: any) => (
                            <option key={s.id} value={String(s.id)}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {errors.subjectId && (
                        <p className="text-xs text-red-400">
                            {errors.subjectId.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Class</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("classId")}
                        defaultValue={data?.classId?.toString()}
                    >
                        <option value="">Select class</option>
                        {classes.map((c: any) => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {errors.classId && (
                        <p className="text-xs text-red-400">
                            {errors.classId.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Teacher</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("teacherId")}
                        defaultValue={data?.teacherId}
                    >
                        <option value="">Select teacher</option>
                        {teachers.map((t: any) => (
                            <option key={t.id} value={t.id}>
                                {t.name + " " + t.surname}
                            </option>
                        ))}
                    </select>
                    {errors.teacherId && (
                        <p className="text-xs text-red-400">
                            {errors.teacherId.message}
                        </p>
                    )}
                </div>
            </div>

            {state.error && (
                <span className="text-red-500">Something went wrong...</span>
            )}

            <button
                className="bg-blue-400 text-white p-2 rounded-md"
                type="submit"
            >
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default LessonForm;
