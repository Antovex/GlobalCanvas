"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserMenuClient() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            // client redirect to sign-in when clerk reports signed out
            router.push("/");
        }
    }, [isSignedIn, isLoaded, router]);

    return <UserButton />;
}