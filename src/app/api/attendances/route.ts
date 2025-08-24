import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { NextResponse } from "next/server";

const ALLOWED_STATUS = ["PRESENT", "ABSENT", "COMPENSATION"] as const;

export async function POST(req: Request) {
    try {
        const userId = await getCurrentUserId(); // require sign-in
        if (!userId)
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );

        // get Clerk user metadata (role) to authorize
        const role = await getUserRole();
        if (role !== "teacher" && role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // validate required fields (lessonId is required per your schema)
        if (!body?.studentId || !body?.lessonId || body?.status == null) {
            //body?.lessonId == null
            return NextResponse.json(
                {
                    error: "missing fields: studentId, lessonId and status are required",
                },
                { status: 400 }
            );
        }

        // guard against string "null" coming from forms/clients
        // if (
        //     typeof body.lessonId === "string" &&
        //     body.lessonId.toLowerCase() === "null"
        // ) {
        //     return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
        // }

        // normalize and validate lessonId (Prisma expects a number for integer FK)
        const lessonId = Number(body.lessonId);
        if (Number.isNaN(lessonId)) {
            return NextResponse.json(
                { error: "invalid lessonId" },
                { status: 400 }
            );
        }

        const status = String(body.status).toUpperCase();
        if (!ALLOWED_STATUS.includes(status as any)) {
            return NextResponse.json(
                {
                    error: `invalid status, must be one of ${ALLOWED_STATUS.join(
                        ", "
                    )}`,
                },
                { status: 400 }
            );
        }

        // map status -> present boolean for current schema
        // (When you migrate to AttendanceStatus enum, persist status instead)
        const present = status === "ABSENT" ? false : true;

        // parse/validate date, default to now
        // Accepts full ISO or YYYY-MM-DD; normalize to a Date object
        const parsedDate = body?.date ? new Date(body.date) : new Date();
        if (isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { error: "invalid date" },
                { status: 400 }
            );
        }

        // compute day range (local) to find existing record for the same day
        const dayStart = new Date(parsedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        // Checking data before sending to DB
        // const attendancePayload = {
        //     studentId: body.studentId,
        //     lessonId: lessonId,
        //     status,
        //     date: parsedDate.toISOString(), // or pass Date object if your DB client accepts it
        // };
        // console.log(attendancePayload);

        // Search for existing attendance for same student + lesson + same day
        const existing = await prisma.attendance.findFirst({
            where: {
                studentId: String(body.studentId),
                lessonId,
                date: {
                    gte: dayStart,
                    lt: dayEnd,
                },
            },
        });

        let result;
        if (existing) {
            // update existing record
            result = await prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    date: parsedDate, // keep supplied timestamp (or store dayStart if you prefer)
                    present,
                },
            });
            // console.log("Record exists");
            return NextResponse.json(
                { ok: true, action: "updated", data: result },
                { status: 200 }
            );
        } else {
            // create new record
            result = await prisma.attendance.create({
                data: {
                    date: parsedDate,
                    present,
                    studentId: String(body.studentId),
                    lessonId,
                },
            });
            // console.log("creating");

            return NextResponse.json(
                { ok: true, action: "created", data: result },
                { status: 201 }
            );
        }
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "invalid request" },
            { status: 500 }
        );
    }
}
