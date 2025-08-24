import { getUserRole } from "@/lib/util";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import UserMenuClient from "./UserMenuClient";

const Navbar = async () => {
    // server-side user and role
    const user = await currentUser();
    const role = await getUserRole();
    const displayName = user?.firstName || user?.fullName || "User";

    return (
        <div className="flex items-center justify-between p-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
                <Image src="/search.png" alt="" width={14} height={14} />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-[200px] p-2 bg-transparent outline-none"
                />
            </div>
            {/* Icons & Users */}
            <div className="flex items-center gap-6 justify-end w-full">
                {/* Message Icon in navbar */}
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                    <Image src="/message.png" alt="" width={20} height={20} />
                </div>
                {/* Annoucement Icon in navbar */}
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <Image
                        src="/announcement.png"
                        alt=""
                        width={20}
                        height={20}
                    />
                    <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                        1
                    </div>
                </div>
                {/* Username & User Role */}
                <div className="flex flex-row justify-center items-center">
                <div className="flex flex-col justify-center pr-2">
                    <span className="text-xs text-right leading-3 font-medium">
                        {displayName}
                    </span>
                    <span className="text-[10px] text-gray-500 text-right">
                        {role}
                    </span>
                </div>
                <div className="flex flex-col">
                {/* client-only part (UserButton + client redirect after sign-out) */}
                <UserMenuClient />
                </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
