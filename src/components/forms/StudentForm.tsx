"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Resolver, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import {
    Dispatch,
    SetStateAction,
    startTransition,
    useActionState,
    useEffect,
    useState,
} from "react";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
        watch,
    } = useForm<StudentSchema>({
        resolver: zodResolver(studentSchema) as Resolver<StudentSchema>,
        defaultValues: {
            ...data,
            // Ensure parentId is a string for the select, or "new"
            parentId:
                data?.parentId ||
                (relatedData?.parents?.length > 0 ? "" : "new"),
        },
    });

    const [img, setImg] = useState<any>(
        type === "update" ? { secure_url: data?.img } : undefined
    );
    const [uploadState, setUploadState] = useState<
        "idle" | "uploading" | "uploaded" | "error"
    >("idle");

    const [state, formAction] = useActionState(
        type === "create" ? createStudent : updateStudent,
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
                `Student has been ${type === "create" ? "created" : "updated"}!`
            );
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    const { classes, parents } = relatedData;
    const parentIdValue = watch("parentId");

    return (
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create"
                    ? "Create a new student"
                    : "Update the student"}
            </h1>

            {/* --- Authentication Information --- */}
            <div className="space-y-4">
                <span className="text-xs text-gray-400 font-medium">
                    Authentication Information
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Username"
                        name="username"
                        defaultValue={data?.username}
                        classname="md:w-full"
                        register={register}
                        error={errors?.username}
                    />
                    <InputField
                        label="Email"
                        name="email"
                        defaultValue={data?.email}
                        classname="md:w-full"
                        register={register}
                        error={errors?.email}
                    />
                    <InputField
                        label="Password"
                        name="password"
                        type="password"
                        defaultValue={data?.password}
                        classname="md:w-full"
                        register={register}
                        error={errors?.password}
                    />
                </div>
            </div>

            {/* --- Personal Information --- */}
            <div className="space-y-4">
                <span className="text-xs text-gray-400 font-medium">
                    Personal Information
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="First Name"
                        name="name"
                        defaultValue={data?.name}
                        classname="md:w-full"
                        register={register}
                        error={errors.name}
                    />
                    <InputField
                        label="Last Name"
                        name="surname"
                        defaultValue={data?.surname}
                        classname="md:w-full"
                        register={register}
                        error={errors.surname}
                    />
                    <InputField
                        label="Phone"
                        name="phone"
                        defaultValue={data?.phone}
                        classname="md:w-full"
                        register={register}
                        error={errors.phone}
                    />
                    <InputField
                        label="Address"
                        name="address"
                        defaultValue={data?.address}
                        classname="md:w-full"
                        register={register}
                        error={errors.address}
                    />
                    <InputField
                        label="Blood Type"
                        name="bloodType"
                        defaultValue={data?.bloodType}
                        classname="md:w-full"
                        register={register}
                        error={errors.bloodType}
                    />
                    <InputField
                        label="Birthday"
                        name="birthday"
                        defaultValue={
                            data?.birthday?.toISOString().split("T")[0]
                        }
                        classname="md:w-full"
                        register={register}
                        error={errors.birthday}
                        type="date"
                    />
                    <div className="flex flex-col gap-2 w-full">
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
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Class</label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("classId")}
                            defaultValue={data?.classId}
                        >
                            {classes.map(
                                (classItem: {
                                    id: number;
                                    name: string;
                                    capacity: number;
                                    _count: { students: number };
                                }) => (
                                    <option
                                        value={classItem.id}
                                        key={classItem.id}
                                    >
                                        {classItem.name} (
                                        {classItem._count.students}/
                                        {classItem.capacity})
                                    </option>
                                )
                            )}
                        </select>
                        {errors.classId?.message && (
                            <p className="text-xs text-red-400">
                                {errors.classId.message.toString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PARENT SECTION --- */}
            <div className="space-y-4">
                <span className="text-xs text-gray-400 font-medium">
                    Parent Information
                </span>
                <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">
                            Assign Parent
                        </label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("parentId")}
                        >
                            <option value="">Select Existing Parent</option>
                            {parents?.map(
                                (parent: {
                                    id: string;
                                    name: string;
                                    surname: string;
                                }) => (
                                    <option value={parent.id} key={parent.id}>
                                        {parent.name} {parent.surname}
                                    </option>
                                )
                            )}
                            {type === "create" && (
                                <option value="new">
                                    -- Create New Parent --
                                </option>
                            )}
                        </select>
                        {errors.parentId?.message && (
                            <p className="text-xs text-red-400">
                                {errors.parentId.message.toString()}
                            </p>
                        )}
                    </div>

                    {/* Conditional "New Parent" Form */}
                    {parentIdValue === "new" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <InputField
                                label="Parent Username"
                                name="parentUsername"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentUsername}
                            />
                            <InputField
                                label="Parent Password"
                                name="parentPassword"
                                type="password"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentPassword}
                            />
                            <InputField
                                label="Parent First Name"
                                name="parentName"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentName}
                            />
                            <InputField
                                label="Parent Last Name"
                                name="parentSurname"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentSurname}
                            />
                            <InputField
                                label="Parent Email"
                                name="parentEmail"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentEmail}
                            />
                            <InputField
                                label="Parent Phone"
                                name="parentPhone"
                                classname="md:w-full"
                                register={register}
                                error={errors?.parentPhone}
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Parent Address"
                                    name="parentAddress"
                                    classname="md:w-full"
                                    register={register}
                                    error={errors?.parentAddress}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Image Upload & Submit --- */}
            <div className="flex flex-col items-center gap-4">
                <CldUploadWidget
                    uploadPreset="school"
                    options={{
                        maxFiles: 1,
                        sources: ["local", "url", "camera"],
                    }}
                    onSuccess={(result, { widget }) => {
                        setImg(result.info);
                        setUploadState("uploaded");
                        widget.close();
                    }}
                    onError={() => setUploadState("error")}
                >
                    {({ open }) => {
                        return (
                            <div className="flex flex-col justify-center items-center gap-2">
                                <div
                                    className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                                    onClick={() => {
                                        setUploadState("uploading");
                                        open();
                                    }}
                                >
                                    <Image
                                        src="/upload.png"
                                        alt=""
                                        width={28}
                                        height={28}
                                    />
                                    <span>
                                        {type === "update"
                                            ? "Change photo"
                                            : "Upload a photo"}
                                    </span>
                                </div>
                                {img?.secure_url && (
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={img.secure_url}
                                            alt="preview"
                                            width={48}
                                            height={48}
                                            className="rounded-md object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    }}
                </CldUploadWidget>

                {state.error && (
                    <span className="text-red-500">Something went wrong!</span>
                )}
                <button
                    type="submit"
                    className="bg-blue-400 text-white p-2 rounded-md w-full"
                >
                    {type === "create" ? "Create" : "Update"}
                </button>
            </div>
        </form>
    );
};

export default StudentForm;
