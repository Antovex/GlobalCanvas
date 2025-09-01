"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
    Dispatch,
    SetStateAction,
    startTransition,
    useActionState,
    useEffect,
    useState,
} from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
    } = useForm<TeacherSchema>({
        resolver: zodResolver(teacherSchema),
    });

    const [img, setImg] = useState<any>(type === "update" ? { secure_url: data?.img } : undefined);
    const [uploadState, setUploadState] = useState<
        "idle" | "uploading" | "uploaded" | "error"
    >("idle");

    const [state, formAction] = useActionState(
        type === "create" ? createTeacher : updateTeacher,
        {
            success: false,
            error: false,
        }
    );

    const onSubmit = handleSubmit((d) => {
        if (data?.id) d.id = data.id;
        startTransition(() => {
            formAction({ ...d, img: img?.secure_url });
        });
    });

    const router = useRouter();

    useEffect(() => {
        if (state.success) {
            toast(
                `Teacher has been ${type === "create" ? "created" : "updated"}!`
            );
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { subjects } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create"
                    ? "Create a new teacher"
                    : "Update the teacher"}
            </h1>
            <span className="text-xs text-gray-400 font-medium">
                Authentication Information
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Username"
                    name="username"
                    defaultValue={data?.username}
                    register={register}
                    error={errors?.username}
                />
                <InputField
                    label="Email"
                    name="email"
                    defaultValue={data?.email}
                    register={register}
                    error={errors?.email}
                />
                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    defaultValue={data?.password}
                    register={register}
                    error={errors?.password}
                />
            </div>
            <span className="text-xs text-gray-400 font-medium">
                Personal Information
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="First Name"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors.name}
                />
                <InputField
                    label="Last Name"
                    name="surname"
                    defaultValue={data?.surname}
                    register={register}
                    error={errors.surname}
                />
                <InputField
                    label="Phone"
                    name="phone"
                    defaultValue={data?.phone}
                    register={register}
                    error={errors.phone}
                />
                <InputField
                    label="Address"
                    name="address"
                    defaultValue={data?.address}
                    register={register}
                    error={errors.address}
                />
                <InputField
                    label="Blood Type"
                    name="bloodType"
                    defaultValue={data?.bloodType}
                    register={register}
                    error={errors.bloodType}
                />
                <InputField
                    label="Birthday"
                    name="birthday"
                    defaultValue={data?.birthday?.toISOString().split("T")[0]}
                    register={register}
                    error={errors.birthday}
                    type="date"
                />
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Sex</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("sex")}
                        defaultValue={data?.sex}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                    {errors.sex?.message && (
                        <p className="text-xs text-red-400">
                            {errors.sex.message.toString()}
                        </p>
                    )}
                </div>
                <div className="flex flex-col gap-2 w-full md:w-1/4">
                    <label className="text-xs text-gray-500">Subjects</label>
                    <select
                        multiple
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        {...register("subjects")}
                        defaultValue={data?.subjects?.map((subject: any) => subject.id.toString()) || []}
                    >
                        {subjects.map(
                            (subject: { id: number; name: string }) => (
                                <option value={subject.id} key={subject.id}>
                                    {subject.name}
                                </option>
                            )
                        )}
                    </select>
                    {errors.subjects?.message && (
                        <p className="text-xs text-red-400">
                            {errors.subjects.message.toString()}
                        </p>
                    )}
                </div>

                {/* Image Upload - Now available for both create and update */}
                <CldUploadWidget
                    uploadPreset="school"
                    options={{
                        maxFiles: 1,
                        sources: ["local", "url", "camera"],
                    }}
                    onUploadReady={() => setUploadState("uploading")}
                    onSuccess={(result, { widget }) => {
                        setImg(result.info);
                        setUploadState("uploaded");
                        widget.close();
                    }}
                    onError={() => setUploadState("error")}
                >
                    {({ open }) => {
                        return (
                            <div className="flex flex-col justify-center items-center gap-2 md:w-1/4">
                                <div
                                    className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                                    onClick={() => {
                                        setUploadState("idle");
                                        open();
                                    }}
                                >
                                    <Image
                                        src="/upload.png"
                                        alt=""
                                        width={28}
                                        height={28}
                                    />
                                    {uploadState !== "uploaded" && (
                                        <span>
                                            {uploadState === "uploading"
                                                ? "Uploading…"
                                                : uploadState === "error"
                                                ? "Retry upload"
                                                : type === "update" 
                                                ? "Change photo"
                                                : "Upload a photo"}
                                        </span>
                                    )}
                                </div>

                                {/* status badge */}
                                <span
                                    className={`text-xs px-2 py-1 rounded-md font-medium ${
                                        uploadState === "uploaded"
                                            ? "bg-green-50 text-green-700"
                                            : uploadState === "uploading"
                                            ? "bg-yellow-50 text-yellow-700"
                                            : uploadState === "error"
                                            ? "bg-red-50 text-red-700"
                                            : "bg-gray-50 text-slate-600"
                                    }`}
                                >
                                    {uploadState === "idle"
                                        ? type === "update" && data?.img ? "Current photo" : ""
                                        : uploadState === "uploading"
                                        ? "Uploading"
                                        : uploadState === "uploaded"
                                        ? "New photo uploaded"
                                        : "Error"}
                                </span>

                                {/* preview + remove */}
                                {img?.secure_url && (
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={img.secure_url}
                                            alt="preview"
                                            width={48}
                                            height={48}
                                            className="rounded-md object-cover"
                                        />
                                        <button
                                            type="button"
                                            className="text-xs text-red-600 px-2 py-1 rounded-md border border-red-100 bg-red-50"
                                            onClick={() => {
                                                setImg(type === "update" ? { secure_url: "/noAvatar.png" } : undefined);
                                                setUploadState("idle");
                                            }}
                                        >
                                            {type === "update" ? "Remove photo" : "Remove"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                </CldUploadWidget>
            </div>
            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button
                className="bg-blue-400 text-white p-2 rounded-md"
                type="submit"
                disabled={uploadState === "uploading"}
            >
                {uploadState === "uploading"
                    ? "Uploading…"
                    : type === "create"
                    ? "Create"
                    : "Update"}
            </button>
        </form>
    );
};

export default TeacherForm;
