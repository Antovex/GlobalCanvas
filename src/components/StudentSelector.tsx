"use client";

import { useRouter, useSearchParams } from "next/navigation";

type StudentSelectorProps = {
    students: {
        id: string;
        name: string;
        surname: string;
        class: { name: string };
    }[];
    currentStudentId?: string;
};

const StudentSelector = ({ students, currentStudentId }: StudentSelectorProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleStudentChange = (studentId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (studentId) {
            params.set("studentId", studentId);
        } else {
            params.delete("studentId");
        }
        params.delete("page"); // Reset to first page
        
        router.push(`?${params.toString()}`);
    };

    return (
        <select
            className="px-4 py-2 border rounded-md"
            value={currentStudentId || ""}
            onChange={(e) => handleStudentChange(e.target.value)}
        >
            <option value="">All Students</option>
            {students.map((student) => (
                <option key={student.id} value={student.id}>
                    {student.name} {student.surname} ({student.class.name})
                </option>
            ))}
        </select>
    );
};

export default StudentSelector;