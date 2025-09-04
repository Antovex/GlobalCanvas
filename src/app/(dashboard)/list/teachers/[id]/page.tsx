import Announcements from "@/components/Announcements";
import Image from "next/image";
import Link from "next/link";
import Performance from "@/components/Performance";
import FormModal from "@/components/FormModal";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { Teacher } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getUserRole } from "@/lib/util";
import FormContainer from "@/components/FormContainer";

const SingleTeacherPage = async ({ params }: { params: any }) => {
    const role = await getUserRole();

    const resolvedParams = await params;
    const { id } = resolvedParams as { id: string };

    const teacher:
        | (Teacher & {
              _count: { subjects: number; lessons: number; classes: number };
              subjects: { id: number; name: string }[];
          })
        | null = await prisma.teacher.findUnique({
        where: { id },
        include: {
            subjects: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    subjects: true,
                    lessons: true,
                    classes: true,
                },
            },
        },
    });

    if (!teacher) {
        return notFound();
    }
    return (
        <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
            {/* LEFT */}
            <div className="w-full xl:w-2/3">
                {/* TOP */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* TEACHER INFO CARD */}
                    <div className="bg-Sky py-6 px-4 rounded-md flex-1 flex gap-4">
                        {/* IMAGE CONTAINER */}
                        <div className="w-1/3">
                            <Image
                                src={teacher.img || "/noAvatar.png"}
                                alt=""
                                width={144}
                                height={144}
                                className="w-36 h-36 rounded-full object-cover"
                            />
                        </div>
                        {/* TEXT CONTAINER */}
                        <div className="w-2/3 flex flex-col justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-semibold">
                                    {teacher.name + " " + teacher.surname}
                                </h1>
                                {role === "admin" && (
                                    <FormContainer
                                        table="teacher"
                                        type="update"
                                        data={teacher}
                                    />
                                )}
                            </div>
                            {/* <p className="text-sm text-gray-500">
                                Lorem, ipsum dolor sit amet consectetur
                                adipisicing elit.
                            </p> */}
                            <div className="flex items-center justify-around gap-2 flex-wrap text-xs font-medium">
                                <div className="w-full flex items-center gap-2">
                                    <Image
                                        src="/blood.png"
                                        alt=""
                                        width={14}
                                        height={14}
                                        aria-hidden="true"
                                    />
                                    <span>{teacher.bloodType}</span>
                                </div>
                                <div className="w-full flex items-center gap-2">
                                    <Image
                                        src="/date.png"
                                        alt=""
                                        width={14}
                                        height={14}
                                        aria-hidden="true"
                                    />
                                    <span>{new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}</span>
                                </div>
                                <div className="w-full flex items-center gap-2">
                                    <Image
                                        src="/mail.png"
                                        alt=""
                                        width={14}
                                        height={14}
                                        aria-hidden="true"
                                    />
                                    <span>{teacher.email || "-"}</span>
                                </div>
                                <div className="w-full flex items-center gap-2">
                                    <Image
                                        src="/phone.png"
                                        alt=""
                                        width={12}
                                        height={12}
                                        aria-hidden="true"
                                    />
                                    <span>{teacher.phone || "-"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SMALL INFO CARDS */}
                    <div className="flex-1 flex gap-4 justify-between flex-wrap">
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[47.9%] xl:w-[45%] 2xl:w-[47.9%]">
                            <Image
                                src="/singleAttendance.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            {/* TODO: Add attendance system for teachers similar to students and use the data here */}
                            <div className="">
                                <h1 className="text-xl font-semibold">90%</h1>
                                <span className="text-sm text-gray-400">
                                    Attendance
                                </span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[47.9%] xl:w-[45%] 2xl:w-[47.9%]">
                            <Image
                                src="/singleBranch.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{teacher._count.subjects}</h1>
                                <span className="text-sm text-gray-400">
                                    Subjects
                                </span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[47.9%] xl:w-[45%] 2xl:w-[47.9%]">
                            <Image
                                src="/singleLesson.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{teacher._count.lessons}</h1>
                                <span className="text-sm text-gray-400">
                                    Lessons
                                </span>
                            </div>
                        </div>
                        {/* CARD */}
                        <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[47.9%] xl:w-[45%] 2xl:w-[47.9%]">
                            <Image
                                src="/singleClass.png"
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                            <div className="">
                                <h1 className="text-xl font-semibold">{teacher._count.classes}</h1>
                                <span className="text-sm text-gray-400">
                                    Classes
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM */}
                <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
                    <h1>Teacher&apos;s Schedule</h1>
                    <BigCalendarContainer type="teacherId" id={teacher.id} />
                </div>
            </div>
            {/* RIGHT */}
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-md">
                    <h1 className="text-xl font-semibold">Shortcuts</h1>
                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                        <Link
                            className="p-3 rounded-md bg-SkyLight"
                            href={`/list/classes?teacherId=${teacher.id}`}
                        >
                            Teacher&apos;s Classes
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-PurpleLight"
                            href={`/list/students?teacherId=${teacher.id}`}
                        >
                            Teacher&apos;s Students
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-YellowLight"
                            href={`/list/lessons?teacherId=${teacher.id}`}
                        >
                            Teacher&apos;s Lessons
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-pink-50"
                            href={`/list/exams?teacherId=${teacher.id}`}
                        >
                            Teacher&apos;s Exams
                        </Link>
                        <Link
                            className="p-3 rounded-md bg-SkyLight"
                            href={`/list/assignments?teacherId=${teacher.id}`}
                        >
                            Teacher&apos;s Assignments
                        </Link>
                    </div>
                </div>
                <Performance />
                <Announcements />
            </div>
        </div>
    );
};

export default SingleTeacherPage;
