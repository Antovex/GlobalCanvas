"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import {
    Dispatch,
    SetStateAction,
    startTransition,
    useActionState,
    useEffect,
} from "react";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ParentForm = ({
    setOpen,
    type,
    data,
}: {
    setOpen: Dispatch<SetStateAction<boolean>>;
    type: "create" | "update";
    data?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ParentSchema>({
        resolver: zodResolver(parentSchema),
    });

    const [state, formAction] = useActionState(
        type === "create" ? createParent : updateParent,
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
                `Parent has been ${type === "create" ? "created" : "updated"}!`
            );
            setOpen(false);
            router.refresh();
        }
    }, [state, router, type, setOpen]);

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Create a new parent" : "Update the parent"}
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
            </div>
            
            {state.error && (
                <span className="text-red-500">Something went wrong!</span>
            )}
            <button
                type="submit"
                className="bg-blue-400 text-white p-2 rounded-md"
            >
                {type === "create" ? "Create" : "Update"}
            </button>
        </form>
    );
};

export default ParentForm;