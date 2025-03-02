'use client';

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { Toast_Custom as Toast } from "@/components/ui/toast_custom";

export default function DashboardPage() {

    const { data: session, update } = useSession();
    const [ error, setError ] = useState<string | null>(null);

    const formSchema = z.object({
        username: z.string().min(3, {
            message: 'Нужно написать минимум 3 символа'
        }).max(15, {message: 'Максимальное количество символов: (15)'}),
        email: z.string().email()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
          email: session?.user?.email ?? "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Form Values:', values);
        const response = await fetch('/api/replace', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })

        
        if (response.ok) {
            await update();
            const text = await response.json();
            Toast({errormessage:text.message, setError:setError, type:'success'});
        } else {
            console.error("Ошибка при обновлении");
        }
        
    }
    return (
        <div>
            <h1 className="text-lg font-bold">Профиль</h1>
            <p className="text-sm text-muted-foreground">Именно так вас увидят другие на сайте</p>
            <Separator className="mt-4 bg-gray-400"/>
            <div className="mt-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={field.name}>Никнейм</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder={session?.user?.name || 'Никнейм'} {...field}/>
                          </FormControl>
                          <FormDescription>
                            Ваше отображаемое имя на сайте
                          </FormDescription>
                          <FormMessage/>
                        </FormItem>
                      )}
                    ></FormField>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={field.name}>Почта</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={session?.user?.email || 'Почта'} {...field}/>
                          </FormControl>
                          <FormDescription>
                            Почта для связи с вами
                          </FormDescription>
                          <FormMessage/>
                        </FormItem>
                      )}
                    >
                    </FormField>
                    <Button type="submit">Сохранить</Button>
                  </form>
                </Form>
            </div>
        </div>
    )
}
