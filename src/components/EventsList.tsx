import { prisma } from "@/lib/prisma";

const EventList = async ({ dateParam }: { dateParam: string | undefined }) => {
    const date = dateParam ? new Date(dateParam) : new Date();

    const data = await prisma.event.findMany({
        where: {
            startTime: {
                gte: new Date(date.setHours(0, 0, 0, 0)),
                lte: new Date(date.setHours(23, 59, 59, 999)),
            },
        },
    });

    if (data.length === 0) {
        return (
            <div
                role="status"
                className="flex flex-col justify-center items-center p-6 rounded-md"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-12 h-12 text-purple-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4M8 3v4M3 11h18" />
                    <circle
                        cx="8.5"
                        cy="15.5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                    />
                    <circle
                        cx="15.5"
                        cy="15.5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                    />
                </svg>

                <p className="mt-3 text-center font-semibold text-gray-400">
                    There are no events for the selected date.
                </p>
                {/* optional CTA */}
                {/* <a href="/events/create" className="mt-3 text-sm text-purple-600 hover:underline">Create an event</a> */}
            </div>
        );
    }

    return data.map((event) => (
        <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-Sky even:border-t-Purple"
            key={event.id}
        >
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-gray-600">{event.title}</h1>
                <span className="text-gray-300 text-xs">
                    {event.startTime.toLocaleTimeString("en-UK", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    })}
                </span>
            </div>
            <p className="mt-2 text-gray-400 text-sm">{event.description}</p>
        </div>
    ));
};

export default EventList;
