'use client';

import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlignJustify, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface HeaderProps {
    classname?: string;
}

export default function Header(classname: HeaderProps) {

  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/login' || pathname === '/api/auth/verify-request' || pathname === '/login/loginwithpassword') {
    return null;
  }

  return (
    <header className={cn(`w-full border-b shadow-sm bg-white sticky top-0 z-50 bg-background/80 backdrop-blur-md`, classname)}>
      <div className="container mx-auto flex items-center justify-between py-4 px-6 h-16">

        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <Image src="/logo.svg" width={45} height={45} alt="Logo" />
          RentEase
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/rent" className="text-gray-700 hover:text-black transition">
            Сдать жильё
          </Link>
          <Link href="/support" className="text-gray-700 hover:text-black transition">
            Центр помощи
          </Link>
        </nav>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className='flex rounded-full border border-gray-300 gap-2 px-2 py-1 items-center hover:shadow-md duration-200'>
              <AlignJustify size={30} className="ml-1" />

              {session?.user ? (
                <Avatar>
                  <AvatarImage src={session.user?.image as string} alt={session.user.name ?? "User"} />
                  <AvatarFallback>{session.user.name?.slice(0, 2).toUpperCase() ?? "CN"}</AvatarFallback>
                </Avatar>
              ) : <CircleUserRound size={30} />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            {session ? (
              <div>
                <div className="border-b px-5 py-2 font-semibold">{session.user?.name ?? 'User'}</div>
                <div className="flex flex-col">
                  <Link href="/dashboard/account" className="px-5 py-2 hover:bg-gray-100">Мой профиль</Link>
                  <Link href={'/rent'} className="px-5 py-2  hover:bg-gray-100">Сдать на RentEase</Link>
                  <Link href={'/support'} className="px-5 py-2 hover:bg-gray-100">Центр помощи</Link>
                  <Button onClick={() => signOut()} variant={"outline"}  className="mt-4 text-left hover:bg-gray-100"><span className="font-semibold">Выйти</span></Button>
                </div>
              </div>
              
            ) : (
              <div>
                <div className="">
                  <Button variant="outline" className="w-full p-0 flex items-center justify-center hover:bg-gray-100">
                    <Link className="w-full flex items-center justify-center h-full" href="/login">Войти</Link>
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
