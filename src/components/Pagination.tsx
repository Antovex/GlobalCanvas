"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Pagination = ({ page = 1, count = 0 }: { page?: number; count?: number }) => {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const check = () => setIsMobile(window.innerWidth < 640);
        const debouncedCheck = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(check, 150);
        };
        check();
        window.addEventListener("resize", debouncedCheck);
        return () => {
            window.removeEventListener("resize", debouncedCheck);
            clearTimeout(timeoutId);
        };
    }, []);

    const total = Math.max(1, Math.ceil(count / ITEM_PER_PAGE));

    const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
    const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

    const changePage = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        router.push(`${window.location.pathname}?${params.toString()}`);
    };

    // build compact page list with ellipses for desktop
    const buildPages = () => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: (number | string)[] = [];
        pages.push(1);
        if (page > 4) pages.push("...");
        const start = Math.max(2, page - 2);
        const end = Math.min(total - 1, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        if (page < total - 3) pages.push("...");
        pages.push(total);
        return pages;
    };

    // mobile compact UI
    if (isMobile) {
        return (
            <div className="p-4 flex items-center justify-between text-gray-500">
                <button
                    disabled={!hasPrev}
                    className="py-2 px-3 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => changePage(page - 1)}
                >
                    Prev
                </button>

                <div className="text-sm">
                    Page <span className="font-semibold">{page}</span> of <span className="font-medium">{total}</span>
                </div>

                <button
                    disabled={!hasNext}
                    className="py-2 px-3 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => changePage(page + 1)}
                >
                    Next
                </button>
            </div>
        );
    }

    // desktop / tablet UI with limited buttons and horizontal scroll to avoid overflow
    const pages = buildPages();

    return (
        <div className="p-4 flex items-center justify-between text-gray-500">
            <button
                disabled={!hasPrev}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => changePage(page - 1)}
            >
                Prev
            </button>

            <div className="flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap px-2">
                {pages.map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-xs text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            className={`px-2 rounded-sm ${page === p ? "bg-Sky" : ""}`}
                            onClick={() => changePage(Number(p))}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            <button
                disabled={!hasNext}
                className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => changePage(page + 1)}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
