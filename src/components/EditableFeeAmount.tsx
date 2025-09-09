"use client";

import { updateFeeAmount } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";

type EditableFeeAmountProps = {
    studentId: string;
    month: string;
    initialAmount: number;
    onUpdate?: (amount: number) => void; // Callback for parent updates
};

const EditableFeeAmount = ({ 
    studentId, 
    month, 
    initialAmount,
    onUpdate 
}: EditableFeeAmountProps) => {
    const [amount, setAmount] = useState(initialAmount);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = async () => {
        if (amount === initialAmount || loading) {
            setIsEditing(false);
            return;
        }

        if (amount < 0) {
            toast.error("Amount cannot be negative");
            setAmount(initialAmount);
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            const result = await updateFeeAmount(studentId, month, amount);
            
            if (result.success) {
                toast.success(`Fee amount updated to ₹${amount}`);
                setIsEditing(false);
                onUpdate?.(amount); // Notify parent component
            } else {
                setAmount(initialAmount); // Revert on error
                toast.error(result.error || "Failed to update amount");
                setIsEditing(false);
            }
        } catch (error) {
            setAmount(initialAmount); // Revert on error
            toast.error("Failed to update amount. Please try again.");
            setIsEditing(false);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setAmount(initialAmount);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setAmount(initialAmount);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1">
                <span className="text-sm">₹</span>
                <input
                    ref={inputRef}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-20 px-2 py-1 border border-blue-300 rounded text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    disabled={loading}
                />
                {loading && (
                    <div className="text-xs text-gray-500">Saving...</div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className="font-semibold hover:text-blue-600 hover:underline transition-colors disabled:opacity-50"
            disabled={loading}
            title="Click to edit amount"
        >
            ₹{amount}
        </button>
    );
};

export default EditableFeeAmount;