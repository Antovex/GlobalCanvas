"use client";

import { updateStudentFeeStatus } from "@/lib/actions";
import { useState } from "react";
import { toast } from "react-toastify";

type FeeStatusSwitchProps = {
    studentId: string;
    month: string;
    initialPaid: boolean;
    amount: number;
    onUpdate?: (paid: boolean) => void; // Callback for parent updates
};

const FeeStatusSwitch = ({
    studentId,
    month,
    initialPaid,
    amount,
    onUpdate,
}: FeeStatusSwitchProps) => {
    const [paid, setPaid] = useState(initialPaid);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        if (loading) return;

        setLoading(true);
        const newPaidStatus = !paid;
        
        // Optimistic update
        setPaid(newPaidStatus);

        try {
            const result = await updateStudentFeeStatus(studentId, month, newPaidStatus, amount);
            
            if (result.success) {
                toast.success(`Fee marked as ${newPaidStatus ? 'paid' : 'unpaid'}!`);
                onUpdate?.(newPaidStatus); // Notify parent component
            } else {
                // Revert on error
                setPaid(paid);
                toast.error(result.error || "Failed to update fee status");
            }
        } catch (error) {
            // Revert on error
            setPaid(paid);
            toast.error("Failed to update fee status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                paid ? "bg-green-600" : "bg-red-400"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-pressed={paid}
            aria-label={paid ? "Mark as unpaid" : "Mark as paid"}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    paid ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    );
};

export default FeeStatusSwitch;