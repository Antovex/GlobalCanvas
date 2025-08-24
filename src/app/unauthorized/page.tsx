"use client";

import Image from "next/image";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const UnauthorizedPage = () => {
    const { signOut } = useClerk();
    const router = useRouter();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-[#EDF9FD] to-white rounded-xl shadow-2xl p-8 mx-auto max-w-lg mt-16">
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 mb-2">
                    <Image
                        src="/logo.png"
                        alt="GlobalCanvas Logo"
                        width={48}
                        height={48}
                        className="drop-shadow-lg"
                    />
                    <h2 className="text-3xl font-extrabold text-purple-700 tracking-tight drop-shadow">
                        GlobalCanvas
                    </h2>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-14 w-14 text-purple-400 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636a9 9 0 11-12.728 0M12 9v2m0 4h.01"
                    />
                </svg>
                <h1 className="text-2xl font-bold text-purple-700">
                    Unauthorized Access
                </h1>
                <p className="text-gray-500 text-center text-base mt-2">
                    You do not have permission to access this page.
                    {/* <br />
                    This may be because your role is not assigned or your
                    account is blocked.
                    <br /> */}
                    Please contact the administrator for assistance.
                </p>
                <div className="flex flex-col">
                    <button
                        className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow hover:from-purple-700 hover:to-purple-900 transition"
                        onClick={() => (window.location.href = "/")}
                    >
                        Back to Home
                    </button>
                    <button
                        className="mt-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold shadow hover:from-purple-600 hover:to-purple-900 transition"
                        onClick={async () => {
                            await signOut();
                            router.push("/");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
