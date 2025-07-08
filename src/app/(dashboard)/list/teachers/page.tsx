import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";

const TeacherPage = () => {
    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP BAR */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    All Teachers
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    {/* Filter Button */}
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/filter.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                    {/* Sort Button */}
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/sort.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                    {/* Add new teacher button */}
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-Yellow">
                            <Image
                                src="/plus.png"
                                alt=""
                                width={14}
                                height={14}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* LIST */}
            

            {/* PAGINATION BAR */}
            <Pagination />
        </div>
    );
};

export default TeacherPage;
