import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher(["/student", "/teacher"]);

const matchers = Object.keys(routeAccessMap).map((route) => ({
    matcher: createRouteMatcher([route]),
    allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
    // if (isProtectedRoute(req)) auth().protect()

    const { sessionClaims } = await auth();

    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // Always allow access to the root '/' route
    if (req.nextUrl.pathname === "/") {
        return NextResponse.next();
    }
    for (const { matcher, allowedRoles } of matchers) {
        if (matcher(req)) {
            if (!role) {
                // Authenticated user but no role metadata: redirect to login page
                return NextResponse.redirect(new URL(`/`, req.url));
            }
            if (!allowedRoles.includes(role)) {
                // Validate role against known safe values before redirecting
                const safeRoles = ["admin", "teacher", "student", "parent"];
                if (safeRoles.includes(role)) {
                    return NextResponse.redirect(new URL(`/${role}`, req.url));
                } else {
                    return NextResponse.redirect(new URL(`/unauthorized`, req.url));
                }
            }
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
