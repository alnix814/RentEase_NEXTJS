"use client";

import { UserRound, BarChart3, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {

    const pathName = usePathname();

    return (
        <div className="mx-10 mt-10 ">
            <div className="flex flex-col gap-4 xl:gap-10 xl:flex-row">
                <section className="w-full grid gap-2 h-24 xl:w-64">
                    <Link href={'/dashboard'}
                        className={
                            `flex gap-3 items-center btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2 transition duration-200 text-center xl:text-left ${pathName === '/dashboard' ? 'bg-[#e7e7e9]' : ''}`
                        }><BarChart3 className="" />Статистика</Link>
                    <Link href={'/dashboard/rentals'}
                        className={
                            `flex gap-3 items-center btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2 transition duration-200 text-center xl:text-left ${pathName === '/dashboard/rentals' ? 'bg-[#e7e7e9]' : ''}`
                        }><Home />Аренды</Link>
                    <Link href={'/dashboard/account'}
                        className={
                            `flex gap-3 items-center btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2 transition duration-200 text-center xl:text-left ${pathName === '/dashboard/account' ? 'bg-[#e7e7e9]' : ''}`
                        }><UserRound />Профиль</Link>
                </section>
                <section className="w-full mt-10 lg:mt-0 xl:mt-0">
                    {children}
                </section>
            </div>
        </div>
    );
}