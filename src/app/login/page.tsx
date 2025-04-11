"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toast_Custom } from '@/components/ui/toast_custom';
import { Loader2 } from "lucide-react"
import { Separator } from '@/components/ui/separator';

export default function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (error) {
            Toast_Custom({ errormessage: error, setError: () => { }, type: 'error' });
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await signIn("email", {
                email,
                callbackUrl: "/",
            });

            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/");
            }
        } finally {
            setLoading(false);
        }

    };

    const handleWithPassword = () => {
        router.push('/login/loginwithpassword');
    }

    return (
        <div className="flex h-screen flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Image
                    src='/logo.svg'
                    width={55}
                    height={55}
                    alt='logo'
                    className='mx-auto h-14 w-auto'
                ></Image>
                <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                    Войдите в свою учетную запись
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} method="POST" className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                            Электронная почта
                        </label>
                        <div className="mt-2">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                            />
                        </div>
                    </div>

                    <div>
                        {loading ? (
                            <Button
                                type='submit'
                                className='flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs'
                                disabled
                            >
                                <Loader2 className='animate-spin' />
                                Подождите
                            </Button>
                        ) : (
                            <Button
                                type='submit'
                                className='flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs'
                            >
                                Войти
                            </Button>
                        )}
                    </div>
                </form>
                <div>
                    <Button
                        onClick={() => handleWithPassword()}
                        variant={'outline'}
                        className='flex w-full justify-center rounded-md text-sm/6 mt-4 font-semibold border-gray-400 text-black shadow-xs'
                    >
                        Войти с паролем
                    </Button>
                </div>
                <div>
                    <div className='flex items-center gap-4 mt-4'>
                        <Separator className=' bg-gray-400 flex-1' />
                        <span className='text-sm text-gray-500 mb-1'>или</span>
                        <Separator className=' bg-gray-400 flex-1' />
                    </div>
                    <div className='mt-4 flex justify-center'>
                        <Button className='bg-black rounded-xl py-6' onClick={() => signIn('yandex', { callbackUrl: '/' })}>
                            <Image src={'/yandex.png'} width={40} height={40} alt='yandex'/>
                            Войти с помощью Yandex ID
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
