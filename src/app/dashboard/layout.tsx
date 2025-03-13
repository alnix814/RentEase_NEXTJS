"use client";

import { Separator } from "@/components/ui/separator";
import { Toast_Custom } from "@/components/ui/toast_custom";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter} from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({children,}: Readonly<{children: React.ReactNode;}>) {

    const pathName = usePathname();
    const router = useRouter();
    const session = useSession();

    useEffect(() => {
        if (['/dashboard', '/dashboard/account'].includes(pathName) && !session.data?.user) {
          router.push('/login');
          Toast_Custom({ errormessage: 'Вы не авторизованы', setError: () => {}, type: 'error' });
        }
    });

  return (
    <div className="mx-10">
        <section className="mt-10 mb-5">
            <h1 className="text-2xl font-bold">Настройки</h1>
            <p className="text-muted-foreground">Управляйте вашими данными и настройками профиля</p>
            <Separator className="mt-5 bg-gray-400"/>
        </section>
        <div className="flex gap-10">
            <section className="w-64 grid gap-2 h-24">
                <Link href={'/dashboard/'} 
                className={
                    `btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2 transition duration-200 ${pathName === '/dashboard' ? 'bg-[#e7e7e9]' : ''}`
                }>Профиль</Link>
                <Link href={'/dashboard/account'} 
                className={
                    `btn btn-primary hover:bg-[#e7e7e9] rounded-md p-2 transition duration-200 ${pathName === '/dashboard/account' ? 'bg-[#e7e7e9]' : ''}`
                    }>Аккаунт</Link>
            </section>
            <section className="">
                {children}
            </section>
        </div>
        
    </div>
  );
}