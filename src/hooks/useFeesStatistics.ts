"use client";

import { useState, useCallback } from "react";

type Statistics = {
    totalStudents: number;
    paidCount: number;
    unpaidCount: number;
};

export const useFeesStatistics = (initialStats: Statistics) => {
    const [statistics, setStatistics] = useState(initialStats);

    const updateStatistics = useCallback((paid: boolean, wasPaid: boolean) => {
        setStatistics(prev => {
            if (paid === wasPaid) return prev; // No change
            
            return {
                ...prev,
                paidCount: paid ? prev.paidCount + 1 : prev.paidCount - 1,
                unpaidCount: paid ? prev.unpaidCount - 1 : prev.unpaidCount + 1,
            };
        });
    }, []);

    return { statistics, updateStatistics };
};