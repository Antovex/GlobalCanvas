"use client";

import { useState } from "react";
import Image from "next/image";
import SupplyForm from "@/components/forms/SupplyForm";

const SupplyFormModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-Yellow hover:brightness-95 active:scale-95 transition"
                aria-label="Add new supply"
            >
                <Image src="/create.png" alt="Add Supply" width={18} height={18} />
            </button>
            {isOpen && <SupplyForm onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default SupplyFormModal;