import React from "react";

const DbError = ({ message }: { message?: string }) => (
    <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4"
        role="alert"
    >
        <strong className="font-bold">Database Error: </strong>
        <span className="block sm:inline">
            {message ||
                "Unable to connect to the database. Please try again later."}
        </span>
    </div>
);

export default DbError;
