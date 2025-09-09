"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: "/home.png",
                label: "Home",
                href: "/",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/teacher.png",
                label: "Teachers",
                href: "/list/teachers",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/student.png",
                label: "Students",
                href: "/list/students",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/parent.png",
                label: "Parents",
                href: "/list/parents",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/subject.png",
                label: "Subjects",
                href: "/list/subjects",
                visible: ["admin"],
            },
            {
                icon: "/class.png",
                label: "Classes",
                href: "/list/classes",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/lesson.png",
                label: "Lessons",
                href: "/list/lessons",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/exam.png",
                label: "Exams",
                href: "/list/exams",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/assignment.png",
                label: "Assignments",
                href: "/list/assignments",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/result.png",
                label: "Results",
                href: "/list/results",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/attendance.png",
                label: "Mark Student Attendance",
                href: "/list/attendance",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/attendance.png",
                label: "Student Attendance History",
                href: "/list/myattendance",
                visible: ["admin", "teacher"],
            },
            {
                icon: "/teacher.png",
                label: "Mark Teacher Attendance",
                href: "/list/teacher-attendance",
                visible: ["admin"],
            },
            {
                icon: "/teacher.png",
                label: "Teacher Attendance History",
                href: "/list/teacher-attendance-history",
                visible: ["admin"],
            },
            {
                icon: "/teacher.png",
                label: "My Attendance",
                href: "/list/teacher-attendance-history",
                visible: ["teacher"],
            },
            {
                icon: "/attendance.png",
                label: "Check Attendance",
                href: "/list/myattendance",
                visible: ["parent", "student"],
            },
            {
                icon: "/finance.png",
                label: "Student Fees",
                href: "/list/student-fees",
                visible: ["admin"],
            },
            {
                icon: "/calendar.png",
                label: "Events",
                href: "/list/events",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: "/create.png",
                label: "Supplies",
                href: "/list/supplies",
                visible: ["admin"],
            },
            // {
            //     icon: "/message.png",
            //     label: "Messages",
            //     href: "/list/messages",
            //     visible: ["admin", "teacher", "student", "parent"],
            // },
            {
                icon: "/announcement.png",
                label: "Announcements",
                href: "/list/announcements",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
    // {
    //     title: "OTHER",
    //     items: [
    //         {
    //             icon: "/profile.png",
    //             label: "Profile",
    //             href: "/profile",
    //             visible: ["admin", "teacher", "student", "parent"],
    //         },
    //         {
    //             icon: "/setting.png",
    //             label: "Settings",
    //             href: "/settings",
    //             visible: ["admin", "teacher", "student", "parent"],
    //         },
    //         {
    //             icon: "/logout.png",
    //             label: "Logout",
    //             href: "/logout",
    //             visible: ["admin", "teacher", "student", "parent"],
    //         },
    //     ],
    // },
];

export default function Menu({ role }: { role: string }) {
    // const role = await getUserRole();

    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile: Hamburger */}
            <div className="lg:hidden flex items-center justify-between mb-4">
                <button
                    aria-label="Open menu"
                    className="p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setOpen(true)}
                >
                    {/* simple hamburger svg */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 7H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M4 17H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Desktop menu (hidden on small screens) */}
            <div className="hidden lg:block mt-4 text-sm">
                {menuItems.map((i) => (
                    <div className="flex flex-col gap-2" key={i.title}>
                        <span className="text-gray-400 font-light my-4">
                            {i.title}
                        </span>
                        {i.items.map((item) =>
                            item.visible.includes(role) ? (
                                <Link
                                    href={item.href}
                                    key={item.label}
                                    className="flex items-center justify-start gap-4 md:px-3 text-gray-500 py-2 rounded-md hover:bg-SkyLight"
                                >
                                    <Image
                                        src={item.icon}
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            ) : null
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile drawer */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-40"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="fixed left-0 top-0 h-full w-64 bg-white z-50 p-4 overflow-y-auto shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={28}
                                    height={28}
                                />
                                <div className="flex flex-col leading-tight">
                                    <span className="font-bold">
                                        GlobalCanvas
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        Branch 1
                                    </span>
                                </div>
                            </div>
                            <button
                                aria-label="Close menu"
                                className="p-2 rounded-md hover:bg-gray-100"
                                onClick={() => setOpen(false)}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 6L6 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M6 6L18 18"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {menuItems.map((i) => (
                            <div className="flex flex-col gap-2" key={i.title}>
                                <span className="text-gray-400 font-light my-2">
                                    {i.title}
                                </span>
                                {i.items.map((item) =>
                                    item.visible.includes(role) ? (
                                        <Link
                                            href={item.href}
                                            key={item.label}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-4 text-gray-600 py-2 rounded-md hover:bg-gray-100"
                                        >
                                            <Image
                                                src={item.icon}
                                                alt=""
                                                width={20}
                                                height={20}
                                            />
                                            <span>{item.label}</span>
                                        </Link>
                                    ) : null
                                )}
                            </div>
                        ))}
                    </aside>
                </>
            )}
        </>
    );
}
