"use client";

import { deleteClass, deleteLesson, deleteStudent, deleteSubject, deleteTeacher, deleteParent } from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
    Dispatch,
    SetStateAction,
    useActionState,
    useEffect,
    useState,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
    subject: deleteSubject,
    class: deleteClass,
    teacher: deleteTeacher,
    student: deleteStudent,
    lesson: deleteLesson,
    parent: deleteParent,
    // TODO: OTHER DELETE ACTIONS
    exam: deleteSubject,
    assignment: deleteSubject,
    result: deleteSubject,
    attendance: deleteSubject,
    event: deleteSubject,
    announcement: deleteSubject,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
    loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
    loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
    loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
    loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
    loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
    loading: () => <h1>Loading...</h1>,
});

const forms: {
    [key: string]: (
        setOpen: Dispatch<SetStateAction<boolean>>,
        type: "create" | "update",
        data?: any,
        relatedData?: any
    ) => JSX.Element;
} = {
    teacher: (setOpen, type, data, relatedData) => (
        <TeacherForm
            type={type}
            data={data}
            setOpen={setOpen}
            relatedData={relatedData}
        />
    ),
    student: (setOpen, type, data, relatedData) => (
        <StudentForm
            type={type}
            data={data}
            setOpen={setOpen}
            relatedData={relatedData}
        />
    ),
    subject: (setOpen, type, data, relatedData) => (
        <SubjectForm
            type={type}
            data={data}
            setOpen={setOpen}
            relatedData={relatedData}
        />
    ),
    class: (setOpen, type, data, relatedData) => (
        <ClassForm
            type={type}
            data={data}
            setOpen={setOpen}
            relatedData={relatedData}
        />
    ),
    lesson: (setOpen, type, data, relatedData) => (
        <LessonForm
            type={type}
            data={data}
            setOpen={setOpen}
            relatedData={relatedData}
        />
    ),
    parent: (setOpen, type, data, relatedData) => (
        <ParentForm
            type={type}
            data={data}
            setOpen={setOpen}
        />
    ),
};

const FormModal = ({
    table,
    type,
    data,
    id,
    relatedData,
}: FormContainerProps & { relatedData?: any }) => {
    const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
    const bgColor =
        type === "create"
            ? "bg-Yellow"
            : type === "update"
            ? "bg-Sky"
            : "bg-Purple";

    const [open, setOpen] = useState(false);

    // const Form = () => {
    //     return type === "delete" && id ? (
    //         <form action="" className="p-4 flex flex-col gap-4">
    //             <span className="text-center font-medium">
    //                 All data will be lost. Are you sure you want to delete this{" "}
    //                 {table}?
    //             </span>
    //             <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
    //                 Delete
    //             </button>
    //         </form>
    //     ) : type === "create" || type === "update" ? (
    //         forms[table](type, data)
    //     ) : (
    //         "Form not found!"
    //     );
    // };

    const Form = () => {
        const [state, formAction] = useActionState(deleteActionMap[table], {
            success: false,
            error: false,
        });

        const router = useRouter();

        useEffect(() => {
            if (state.success) {
                const label = table.charAt(0).toUpperCase() + table.slice(1);
                toast(`${label} has been deleted!`);
                setOpen(false);
                router.refresh();
            }
        }, [state, router]);

        if (type === "delete" && id) {
            return (
                <form action={formAction} className="p-4 flex flex-col gap-4">
                    <input
                        type="text | number"
                        name="id"
                        value={id}
                        hidden
                        readOnly
                    />
                    <span className="text-center font-medium">
                        All data will be lost. Are you sure you want to delete
                        this {table}?
                    </span>
                    <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
                        Delete
                    </button>
                </form>
            );
        } else if ((type === "create" || type === "update") && forms[table]) {
            return forms[table](setOpen, type, data, relatedData);
        } else {
            return (
                <div className="text-center text-red-500 font-semibold py-8">
                    Form not found for{" "}
                    <span className="font-bold">{table}</span>!
                </div>
            );
        }
    };

    return (
        <>
            <button
                className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
                onClick={() => setOpen(true)}
            >
                <Image src={`/${type}.png`} alt="" width={16} height={16} />
            </button>
            {open && (
                <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-5 sm:p-6 rounded-lg relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <Form />
                        <button
                            className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-800"
                            onClick={() => setOpen(false)}
                            aria-label="Close modal"
                        >
                            <Image
                                src="/close.png"
                                alt="Close"
                                width={14}
                                height={14}
                            />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FormModal;
