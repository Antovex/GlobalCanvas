"use client";

import { useState } from "react";
import Table from "@/components/Table";
import FeeStatusSwitch from "@/components/FeeStatusSwitch";
import EditableFeeAmount from "@/components/EditableFeeAmount";
import { useFeesStatistics } from "@/hooks/useFeesStatistics";

type StudentWithFeeInfo = {
    id: string;
    name: string;
    surname: string;
    parent: {
        name: string;
        surname: string;
        phone: string;
    } | null;
    class: {
        name: string;
    };
    fees: {
        id: number;
        amount: number;
        paid: boolean;
        paidDate: Date | null;
    }[];
};

type StudentFeesClientProps = {
    data: StudentWithFeeInfo[];
    selectedMonth: string;
    initialStatistics: {
        totalStudents: number;
        paidCount: number;
        unpaidCount: number;
    };
    columns: any[];
};

const StudentFeesClient = ({ 
    data, 
    selectedMonth, 
    initialStatistics,
    columns 
}: StudentFeesClientProps) => {
    const [students, setStudents] = useState(data);
    const { statistics, updateStatistics } = useFeesStatistics(initialStatistics);

    const handleFeeStatusUpdate = (studentId: string, paid: boolean) => {
        const student = students.find(s => s.id === studentId);
        const wasPaid = student?.fees[0]?.paid || false;
        
        // Update local state
        setStudents(prev => 
            prev.map(student => 
                student.id === studentId 
                    ? {
                        ...student,
                        fees: student.fees.length > 0 
                            ? [{ ...student.fees[0], paid }]
                            : [{ id: 0, amount: 2750, paid, paidDate: null }]
                    }
                    : student
            )
        );

        // Update statistics
        updateStatistics(paid, wasPaid);
    };

    const handleAmountUpdate = (studentId: string, amount: number) => {
        setStudents(prev => 
            prev.map(student => 
                student.id === studentId 
                    ? {
                        ...student,
                        fees: student.fees.length > 0 
                            ? [{ ...student.fees[0], amount }]
                            : [{ id: 0, amount, paid: false, paidDate: null }]
                    }
                    : student
            )
        );
    };

    const renderRow = (item: StudentWithFeeInfo) => {
        const feeInfo = item.fees[0] || {
            amount: 2750,
            paid: false,
            paidDate: null,
        };

        return (
            <tr
                key={item.id}
                className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-PurpleLight"
            >
                <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                                {item.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                {item.name} {item.surname}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Student ID: {item.id.slice(-6)}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="hidden md:table-cell px-4 py-4">
                    <div>
                        <p className="font-medium">
                            {item.parent
                                ? `${item.parent.name} ${item.parent.surname}`
                                : "No Parent"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {item.parent?.phone || "No phone"}
                        </p>
                    </div>
                </td>
                <td className="hidden lg:table-cell text-center px-4 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {item.class.name}
                    </span>
                </td>
                <td className="text-center px-4 py-4">
                    <EditableFeeAmount
                        studentId={item.id}
                        month={selectedMonth}
                        initialAmount={feeInfo.amount}
                        onUpdate={(amount) => handleAmountUpdate(item.id, amount)}
                    />
                </td>
                <td className="text-center px-4 py-4">
                    <div className="flex justify-center">
                        <FeeStatusSwitch
                            studentId={item.id}
                            month={selectedMonth}
                            initialPaid={feeInfo.paid}
                            amount={feeInfo.amount}
                            onUpdate={(paid) => handleFeeStatusUpdate(item.id, paid)}
                        />
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <>
            {/* Statistics Cards - Updated in real-time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-blue-600">
                        {statistics.totalStudents}
                    </h3>
                    <p className="text-xs text-gray-600">Total Students</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-green-600">
                        {statistics.paidCount}
                    </h3>
                    <p className="text-xs text-gray-600">Paid</p>
                </div>
                <div className="bg-red-50 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-red-600">
                        {statistics.unpaidCount}
                    </h3>
                    <p className="text-xs text-gray-600">Unpaid</p>
                </div>
            </div>

            {/* Table */}
            <div className="hidden md:block">
                <Table columns={columns} renderRow={renderRow} data={students} />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {students.map((item) => {
                    const feeInfo = item.fees[0] || {
                        amount: 2750,
                        paid: false,
                        paidDate: null,
                    };
                    return (
                        <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">
                                            {item.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">
                                            {item.name} {item.surname}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            {item.class.name}
                                        </p>
                                    </div>
                                </div>
                                <EditableFeeAmount
                                    studentId={item.id}
                                    month={selectedMonth}
                                    initialAmount={feeInfo.amount}
                                    onUpdate={(amount) => handleAmountUpdate(item.id, amount)}
                                />
                            </div>

                            {item.parent && (
                                <div className="text-sm">
                                    <p className="font-medium">
                                        {item.parent.name} {item.parent.surname}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {item.parent.phone}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <FeeStatusSwitch
                                    studentId={item.id}
                                    month={selectedMonth}
                                    initialPaid={feeInfo.paid}
                                    amount={feeInfo.amount}
                                    onUpdate={(paid) => handleFeeStatusUpdate(item.id, paid)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default StudentFeesClient;