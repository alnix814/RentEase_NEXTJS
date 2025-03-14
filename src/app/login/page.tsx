"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toast_Custom } from '@/components/ui/toast_custom';

export default function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (error) {
            Toast_Custom({errormessage: error, setError: () => {}, type: 'error'});
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await signIn("email", {
            email,
            callbackUrl: "/",
        });

        if (res?.error) {
            setError(res.error);
        } else {
            router.push("/");
        }
    };

    return (
        <div className="h-[100vh] flex items-center justify-center px-4">
            <div className="border shadow-xl w-full sm:w-[500px] md:w-[600px] h-[50%] bg-white inline-flex justify-between rounded-xl">
                <div className="w-[50%]">
                    <div className='text-center'>
                        <div className='flex justify-center mt-3'>
                            <Image
                                src="/logo.svg"
                                alt="logo"
                                width={60}
                                height={60}
                            />
                        </div>
                        <div className='text-2xl mt-3'>
                            <h1>Авторизация</h1>
                        </div>
                    </div>
                    <div className='h-[360px]'>
                        <form className='p-5 flex flex-col gap-1' onSubmit={handleSubmit}>
                            <label htmlFor='email'>Email</label>
                            <Input id='email' name='email' type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <Button type='submit' className='mt-3'>Войти</Button>
                        </form>
                    </div>
                </div>
                <div className="w-[50%]">
                    <div className='flex justify-center'>
                        <Image
                            src="/registration-house.png"
                            alt="registration"
                            width={300}
                            height={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
