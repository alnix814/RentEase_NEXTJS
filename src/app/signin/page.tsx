"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import YandexAuthButton from '@/components/ui/yandexauthbutton';
import { signIn } from 'next-auth/react';
import Image from 'next/image'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Toast_Custom } from '@/components/ui/toast_custom';

export default function SignIn() {

    const [email, setEmail] = useState<string>("");
    const [fullname, setFullname] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState<boolean>(false);

    useEffect(() => {
        if (isRegistered) {
          router.push("/");
        }
      }, [isRegistered, router]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullname,
                    email,
                    password
                })
            })

            if (!res.ok) {
                const data = await res.json();
                Toast_Custom({errormessage: data.error || 'Ошибка регистрации', setError});
            }

            const signInResult = await signIn('credentials', {
                fullname,
                email,
                password
            }, { callbackUrl: '/' })

            if (signInResult?.ok) {
                setIsRegistered(true);
            } else {
                Toast_Custom({errormessage: signInResult?.error || 'Ошибка входа при регистрации', setError});
            }
        } catch (err) {
            setError((err as Error).message)
        }
    }

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
                            <h1>Регистрация</h1>
                        </div>
                    </div>
                    <div className='h-[360px]'>
                        <form className='p-5 flex flex-col gap-1' onSubmit={handleSubmit}>
                            <label htmlFor='fullname'>Фамилия Имя</label>
                            <Input id='fullname' name='fullname' type='text' placeholder='ФИ' value={fullname} onChange={(e) => setFullname(e.target.value)} required/>
                            <label htmlFor='email'>Email</label>
                            <Input id='email' name='email' type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required/>
                            <label htmlFor='password'>Пароль</label>
                            <Input id='password' name='password' type='password' placeholder='Пароль' value={password} onChange={(e) => setPassword(e.target.value)} required/>
                            <Button type='submit' className='mt-3'>Зарегистрироваться</Button>

                            <span className='font-medium text-sm text-center'>Уже есть аккаунт? 
                                <Link 
                                href="/login"
                                className='text-blue-500 hover:text-blue-700 ml-2'
                                >Войти</Link>
                            </span>
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
    )
}