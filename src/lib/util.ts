import { auth } from "@clerk/nextjs/server";

export async function getUserRole() : Promise<string> {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    // Validate role against allowed roles
    const allowedRoles = ["admin", "teacher", "student", "parent"];
    if (typeof role === "string" && allowedRoles.includes(role)) {
        return role;
    }
    return "norole";
}

export async function getCurrentUserId() : Promise<string>{
    const { userId } = await auth();
    if (userId) {
        return userId;
    }
    throw new Error("User is not authenticated or user ID could not be retrieved from Clerk.");
}