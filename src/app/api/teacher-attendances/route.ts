import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Only admins can mark teacher attendance
        const role = await getUserRole();
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Validate required fields
        if (!body?.teacherId || body?.present == null) {
            return NextResponse.json(
                {
                    error: "missing fields: teacherId and present are required",
                },
                { status: 400 }
            );
        }

        // Parse and validate date (default to today)
        const parsedDate = body?.date ? new Date(body.date) : new Date();
        if (isNaN(parsedDate.getTime())) {
            return NextResponse.json(
                { error: "invalid date" },
                { status: 400 }
            );
        }

        // Normalize date to start of day for consistency
        const dayStart = new Date(parsedDate);
        dayStart.setHours(0, 0, 0, 0);

        // Check if attendance already exists for this teacher on this date
        const existing = await prisma.teacherAttendance.findUnique({
            where: {
                teacherId_date: {
                    teacherId: String(body.teacherId),
                    date: dayStart,
                }
            },
        });

        let result;
        if (existing) {
            // Update existing record
            result = await prisma.teacherAttendance.update({
                where: { id: existing.id },
                data: {
                    present: Boolean(body.present),
                    date: dayStart,
                },
                include: {
                    teacher: {
                        select: { name: true, surname: true }
                    }
                }
            });
            return NextResponse.json(
                { ok: true, action: "updated", data: result },
                { status: 200 }
            );
        } else {
            // Create new record
            result = await prisma.teacherAttendance.create({
                data: {
                    date: dayStart,
                    present: Boolean(body.present),
                    teacherId: String(body.teacherId),
                },
                include: {
                    teacher: {
                        select: { name: true, surname: true }
                    }
                }
            });

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

export async function GET(req: Request) {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const role = await getUserRole();
        if (role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");
        const teacherId = searchParams.get("teacherId");

        const where: any = {};
        
        if (date) {
            const parsedDate = new Date(date);
            const dayStart = new Date(parsedDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            
            where.date = {
                gte: dayStart,
                lt: dayEnd,
            };
        }

        if (teacherId) {
            where.teacherId = teacherId;
        }

        const attendances = await prisma.teacherAttendance.findMany({
            where,
            include: {
                teacher: {
                    select: { id: true, name: true, surname: true, username: true }
                }
            },
            orderBy: [
                { date: "desc" },
                { teacher: { name: "asc" } }
            ]
        });

        return NextResponse.json({ data: attendances }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "invalid request" },
            { status: 500 }
        );
    }
}