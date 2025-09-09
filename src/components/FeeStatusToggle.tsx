"use client";

import { updateStudentFeeStatus } from "@/lib/actions";
import { useState } from "react";

type FeeStatusToggleProps = {
    studentId: string;
    month: string;
    initialPaid: boolean;
    amount: number;
};

const FeeStatusToggle = ({
    studentId,
    month,
    initialPaid,
    amount,
}: FeeStatusToggleProps) => {
    const [paid, setPaid] = useState(initialPaid);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (loading) return;

        setLoading(true);
        const newPaidStatus = !paid;
        setPaid(newPaidStatus);

        try {
            await updateStudentFeeStatus(
                studentId,
                month,
                newPaidStatus,
                amount
            );
        } catch (error) {
            // Revert on error
            setPaid(paid);
            console.error("Failed to update fee status:", error);
            alert("Failed to update fee status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                paid
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {loading ? "..." : paid ? "Paid" : "Unpaid"}
        </button>
    );
};

export default FeeStatusToggle;
