"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type LessonSelectorProps = {
    lessons: {
        id: number;
        name: string;
        subject: { name: string };
        class: { name: string };
    }[];
    currentLessonId?: string;
};

const LessonSelector = ({ lessons, currentLessonId }: LessonSelectorProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleLessonChange = (lessonId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        if (lessonId) {
            params.set("lessonId", lessonId);
        } else {
            params.delete("lessonId");
        }
        params.delete("page"); // Reset to first page
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Lesson:</label>
            <select
                className="px-3 py-2 border rounded-md text-sm w-[240px]"
                value={currentLessonId || ""}
                onChange={(e) => handleLessonChange(e.target.value)}
            >
                <option value="">Select a lesson</option>
                {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                        {lesson.subject.name} - {lesson.name} ({lesson.class.name})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LessonSelector;