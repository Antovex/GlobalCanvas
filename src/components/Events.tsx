"use client";

import Image from "next/image";

const events = [
    {
        id: 1,
        title: "Event 1",
        time: "12:00PM - 2:00PM",
        description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
        id: 2,
        title: "Event 2",
        time: "12:00PM - 2:00PM",
        description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
        id: 3,
        title: "Event 3",
        time: "12:00PM - 2:00PM",
        description: "lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
];

const Events = () => {
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold my-4">Events</h1>
                <Image
                    src="/moreDark.png"
                    alt=""
                    width={20}
                    height={20}
                    // className="cursor-pointer"
                />
            </div>
            <div className="flex flex-col gap-4">
                {events.map((event) => (
                    <div
                        className="p-5 rounded-lg border-2 border-gray-100 border-t-4 odd:border-t-Sky even:border-t-Purple"
                        key={event.id}
                    >
                        <div className="flex items-center justify-between">
                            <h1 className="font-semibold text-gray-600">
                                {event.title}
                            </h1>
                            <span className="text-xs text-gray-300">
                                {event.time}
                            </span>
                        </div>
                        <p className="mt-2 text-gray-400 text-sm">
                            {event.description}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Events;
