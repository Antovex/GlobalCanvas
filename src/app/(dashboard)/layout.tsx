import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <div className="h-screen flex">
        {/* LEFT */}
        <div className="w-[14%] m:w-[8%] lg:w-[16%] xl:w-[14%] p-4 overflow-y-auto custom-scrollbar">
            <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="hidden lg:block font-bold">GlobalCanvas</span>
            </Link>
            <Menu />
        </div>
        {/* RIGHT */}
        <div className="w-[86%] m:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-y-scroll">
            <Navbar />
            {children}
        </div>
    </div>;
}
