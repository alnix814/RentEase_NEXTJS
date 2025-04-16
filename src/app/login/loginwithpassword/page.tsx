"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { z } from "zod";
import { Loader2 } from "lucide-react"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Toast_Custom } from '@/components/ui/toast_custom';

export default function LoginWithPassword() {
    const [loading, setLoading] = useState<boolean>(false);

    const loginSchema = z.object({
        email: z.string().email({ message: 'Введите корректный email' }),
        password: z.string({ required_error: 'Введите пароль' })
    });

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const handleSubmit = async (values: z.infer<typeof loginSchema>) => {
        setLoading(true);

        try {
            const res = await fetch('/api/loginwith', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                })
            });

            const answer = await res.json();

            if (answer.status === 200) {
                await signIn('credentials', {
                    email: values.email,
                    password: values.password,
                    callbackUrl: '/',
                });
            } else {
                Toast_Custom({ errormessage: answer.message, setError: () => { }, type: 'error' });
            }

        } catch {

        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex h-screen flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <Image
                    src={'/logo.svg'}
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
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={loginForm.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Электронная почта</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={loginForm.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Пароль</FormLabel>
                                    <FormControl>
                                        <Input type='password' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            {loading ? (
                                <Button
                                    type='submit'
                                    className='flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-gray-800 duration-200'
                                    disabled
                                >
                                    <Loader2 className='animate-spin' />
                                    Подождите
                                </Button>
                            ) : (
                                <Button
                                    type='submit'
                                    className='flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-gray-800 duration-200'
                                >
                                    Войти
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}