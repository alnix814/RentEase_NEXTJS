"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import YandexAuthButton from '@/components/ui/yandexauthbutton';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Toast_Custom } from '@/components/ui/toast_custom';

export default function SignIn() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSignIn = async (provider: 'credentials' | 'yandex', data?: { email?: string; password?: string }) => {
        try {
            const signInResult = await signIn(provider, {
                redirect: false,
                ...data,
                ...(provider === 'yandex' ? {callbackUrl: '/'} : {})
            });

            if (signInResult?.ok) {
                router.push('/');
                Toast_Custom({ errormessage: 'Вы успешно вошли!', setError, type: 'success' });
            } else {
                const errormessage = signInResult?.error as string;
                setError(errormessage);
                Toast_Custom({ errormessage, setError });
                console.log(error);
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await handleSignIn('credentials', { email, password });
    };

    const handleYandexSignIn = async () => {
        await handleSignIn('yandex');
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
                            <label htmlFor='password'>Пароль</label>
                            <Input id='password' name='password' type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} required />
                            <Button type='submit' className='mt-3'>Войти</Button>

                            <span className='font-medium text-sm text-center'>Еще нет аккаунта?
                                <Link
                                    href="/signin"
                                    className='text-blue-500 hover:text-blue-700 ml-2'
                                >Зарегистрироваться</Link>
                            </span>

                            <div className='flex items-center justify-center pt-5'>
                                <YandexAuthButton onClick={handleYandexSignIn}/>
                            </div>
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
