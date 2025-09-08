"use client";

import { createSupply } from "@/lib/actions";
import { useState } from "react";

type SupplyFormProps = {
    onClose: () => void;
};

const SupplyForm = ({ onClose }: SupplyFormProps) => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await createSupply(formData);
            onClose();
        } catch (error) {
            console.error("Failed to create supply:", error);
            alert("Failed to create supply. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-white w-full max-w-sm sm:max-w-md mx-4 rounded-lg p-5 sm:p-6 shadow-lg overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">Add New Supply</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                        aria-label="Close form"
                    >
                        ✕
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Supply Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter supply name"
                        />
                    </div>

                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Initial Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            min="0"
                            defaultValue="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                        >
                            {loading ? "Adding..." : "Add Supply"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplyForm;