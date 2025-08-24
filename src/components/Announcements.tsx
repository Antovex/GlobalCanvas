import { prisma } from "@/lib/prisma";
import { getCurrentUserId, getUserRole } from "@/lib/util";
import Image from "next/image";

const Announcements = async () => {
    const role = await getUserRole();
    const userId = await getCurrentUserId();

    const roleConditions = {
        teacher: { lessons: { some: { teacherId: userId! } } },
        student: { students: { some: { id: userId! } } },
        parent: { students: { some: { parentId: userId! } } },
    };

    const data = await prisma.announcement.findMany({
        take: 5,
        orderBy: { date: "desc" },
        where: {
            ...(role !== "admin" && {
            OR: [
                { classId: null },
                {
                    class:
                        roleConditions[role as keyof typeof roleConditions] ||
                        {},
                },
            ],
            }),
        },
    });

    return (
        <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Announcements</h1>
                {/* <span className="text-xs text-gray-400">View All</span> */}
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {data && data.length > 0 ? (
                    <>
                        {(() => {
                            const colors = [
                                "bg-SkyLight",
                                "bg-PurpleLight",
                                "bg-YellowLight",
                            ];
                            return data.map((announcement, idx) => (
                                <div
                                    key={announcement.id}
                                    className={`${
                                        colors[idx % colors.length]
                                    } rounded-md p-4`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-medium">
                                            {announcement.title}
                                        </h2>
                                        <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                                            {announcement.date.toLocaleDateString(
                                                "en-GB"
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {announcement.description}
                                    </p>
                                </div>
                            ));
                        })()}
                    </>
                ) : (
                    <div className="flex flex-col justify-center items-center p-4">
                        <Image src="/announcement.png" alt="No annoucements" width={36} height={36} />

                        <p className="mt-3 text-center font-semibold text-gray-400">
                            No announcements yet...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Announcements;
