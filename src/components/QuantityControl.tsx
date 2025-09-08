"use client";

import { updateSupplyQuantity } from "@/lib/actions";
import { useState } from "react";

type QuantityControlProps = {
    supplyId: number;
    currentQuantity: number;
};

const QuantityControl = ({ supplyId, currentQuantity }: QuantityControlProps) => {
    const [quantity, setQuantity] = useState(currentQuantity);
    const [loading, setLoading] = useState(false);

    const handleQuantityChange = async (change: number) => {
        if (loading) return;
        
        const newQuantity = Math.max(0, quantity + change);
        setQuantity(newQuantity);
        setLoading(true);

        try {
            await updateSupplyQuantity(supplyId, change);
        } catch (error) {
            // Revert on error
            setQuantity(quantity);
            console.error("Failed to update quantity:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleQuantityChange(-1)}
                disabled={loading || quantity <= 0}
                className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
            >
                -
            </button>
            
            <span className="mx-2 min-w-[3rem] text-center font-semibold">
                {quantity}
            </span>
            
            <button
                onClick={() => handleQuantityChange(1)}
                disabled={loading}
                className="w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg"
            >
                +
            </button>
        </div>
    );
};

export default QuantityControl;