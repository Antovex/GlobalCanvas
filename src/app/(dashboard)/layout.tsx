import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { getUserRole } from "@/lib/util";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const role = await getUserRole();

    return (
        <div className="h-screen flex">
            {/* LEFT */}
            <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4 overflow-y-auto custom-scrollbar">
                {/* hide brand on small screens where hamburger is shown */}
                <Link href="/" className="hidden lg:flex items-center justify-start gap-2">
                    <Image src="/logo.png" alt="Logo" width={32} height={32} />
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold">GlobalCanvas</span>
                        <span className="text-xs text-gray-500">Branch 1</span>
                    </div>
                </Link>
                {/* pass role to Menu (Menu is now client) */}
                <Menu role={role} />
            </div>
            {/* RIGHT */}
            <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-y-scroll flex flex-col">
                <Navbar />
                {children}
            </div>
        </div>
    );
}
