"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser();

    const router = useRouter();

    useEffect(() => {
        const role = user?.publicMetadata.role;

        if (role) {
            router.push(`/${role}`);
        }
    }, [user, router]);

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-white">
            <div className="relative">
                <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-br from-purple-300 via-purple-100 to-sky-100 rounded-2xl" />
                <SignIn.Root>
                    <SignIn.Step
                        name="start"
                        className="relative bg-white/80 backdrop-blur-lg p-10 md:p-12 rounded-2xl shadow-2xl flex flex-col gap-6 min-w-[320px] max-w-[400px] border border-purple-200"
                    >
                        <div className="flex flex-col items-center gap-2 mb-2 animate-fade-in">
                            <Image
                                src="/logo.png"
                                alt="GlobalCanvas Logo"
                                width={44}
                                height={44}
                                className="drop-shadow-lg animate-bounce"
                            />
                            <h1 className="text-3xl font-extrabold text-purple-500 tracking-tight drop-shadow">
                                GlobalCanvas
                            </h1>
                            <h2 className="text-gray-400 text-base font-medium">
                                Sign in to your account
                            </h2>
                        </div>
                        <Clerk.GlobalError className="text-sm text-red-400 text-center mb-2" />
                        <Clerk.Field
                            name="identifier"
                            className="flex flex-col gap-2"
                        >
                            <Clerk.Label className="text-xs text-purple-600 font-semibold">
                                Username
                            </Clerk.Label>
                            <Clerk.Input
                                type="text"
                                required
                                className="p-2 rounded-lg ring-1 ring-purple-200 focus:ring-2 focus:ring-purple-400 transition bg-purple-50/40 placeholder:text-purple-300"
                            />
                            <Clerk.FieldError className="text-xs text-red-400" />
                        </Clerk.Field>
                        <Clerk.Field
                            name="password"
                            className="flex flex-col gap-2 mt-2"
                        >
                            <Clerk.Label className="text-xs text-purple-600 font-semibold">
                                Password
                            </Clerk.Label>
                            <Clerk.Input
                                type="password"
                                required
                                className="p-2 rounded-lg ring-1 ring-purple-200 focus:ring-2 focus:ring-purple-400 transition bg-purple-50/40 placeholder:text-purple-300"
                            />
                            <Clerk.FieldError className="text-xs text-red-400" />
                        </Clerk.Field>
                        {/* <div className="my-3 border-t border-purple-100" /> */}
                        <SignIn.Action
                            submit
                            className="bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 hover:from-purple-800 hover:to-purple-800 text-white font-semibold rounded-lg text-base p-[12px] shadow-lg mt-3"
                        >
                            Sign In
                        </SignIn.Action>
                    </SignIn.Step>
                </SignIn.Root>
            </div>
        </div>
    );
};

export default LoginPage;
