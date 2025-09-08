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
                className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow"
            >
                <Image src="/create.png" alt="Add Supply" width={16} height={16} />
            </button>

            {isOpen && <SupplyForm onClose={() => setIsOpen(false)} />}
        </>
    );
};

export default SupplyFormModal;