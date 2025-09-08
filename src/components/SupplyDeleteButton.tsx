"use client";

import { deleteSupply } from "@/lib/actions";
import { useState } from "react";
import Image from "next/image";

type SupplyDeleteButtonProps = {
    supplyId: number;
    supplyName: string;
};

const SupplyDeleteButton = ({ supplyId, supplyName }: SupplyDeleteButtonProps) => {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${supplyName}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await deleteSupply(supplyId);
        } catch (error) {
            console.error("Failed to delete supply:", error);
            alert("Failed to delete supply. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 disabled:opacity-50"
        >
            <Image src="/delete.png" alt="Delete" width={16} height={16} />
        </button>
    );
};

export default SupplyDeleteButton;