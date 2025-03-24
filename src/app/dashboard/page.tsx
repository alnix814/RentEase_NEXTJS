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
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react";
import { Toast_Custom } from "@/components/ui/toast_custom";
import Loading from '@/components/ui/loading_orbit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUser, FiLock, FiBell, FiUpload } from "react-icons/fi";

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const [isloading, setIsloading] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(session?.user?.image || null);

  // Profile form schema
  const profileFormSchema = z.object({
    username: z.string().min(3, {
      message: 'Нужно написать минимум 3 символа'
    }).max(15, { message: 'Максимальное количество символов: (15)' }),
    email: z.string().email({ message: 'Введите корректный email' })
  });

  // Password form schema
  const passwordFormSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Введите текущий пароль' }),
    newPassword: z.string().min(8, { message: 'Пароль должен содержать минимум 8 символов' }),
    confirmPassword: z.string().min(8, { message: 'Подтвердите новый пароль' }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

  // Notification form schema
  const notificationFormSchema = z.object({
    emailNotifications: z.boolean(),
    marketingEmails: z.boolean(),
    securityAlerts: z.boolean(),
  });

  // Initialize forms
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  // Handle profile update
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsloading(true);
    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('email', values.email);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const response = await fetch('/api/replace', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        if (session?.user) {
          session.user.name = updatedUser.name;
          session.user.email = updatedUser.email;
          session.user.image = updatedUser.image;
        }
        await update(session);
        Toast_Custom({ errormessage: updatedUser.message, setError: () => {}, type: 'success' });
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при обновлении профиля', setError: () => {}});
      }
    } catch{
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении профиля', setError: () => {} });
    } finally {
      setIsloading(false);
    }
  };

  // Handle password update
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    setIsloading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (response.ok) {
        Toast_Custom({ errormessage: 'Пароль успешно обновлен', setError: () => {}, type: 'success' });
        passwordForm.reset();
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при обновлении пароля', setError: () => {} });
      }
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении пароля', setError: () => {} });
    } finally {
      setIsloading(false);
    }
  };

  // Handle notification settings update
  const onNotificationSubmit = async (values: z.infer<typeof notificationFormSchema>) => {
    setIsloading(true);
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        Toast_Custom({ errormessage: 'Настройки уведомлений обновлены', setError: () => {}, type: 'success' });
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при обновлении настроек', setError: () => {} });
      }
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении настроек', setError: () => {} });
    } finally {
      setIsloading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('email', session?.user?.email || '');
      formData.append('file', file);

      const response = await fetch('/api/user_avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json();

      if (result.error) {
        Toast_Custom({ errormessage: result.error, setError: () => {} });
        return;
      } else {
        await update();
        Toast_Custom({ errormessage: result.message, setError: () => {}, type: 'success' });
      }
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2 text-center xl:text-left">Настройки профиля</h1>
      <p className="text-sm text-muted-foreground mb-6 text-center xl:text-left">Управляйте своими данными и настройками</p>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 w-full xl:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <FiUser size={16} />
            <span>Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <FiLock size={16} />
            <span>Пароль</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <FiBell size={16} />
            <span>Уведомления</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>Обновите свои личные данные и фото профиля</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || undefined} />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                        <FiUpload size={16} />
                        <span>Загрузить фото</span>
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG или GIF. Макс. 2MB</p>
                  </div>
                </div>

                <div className="flex-1">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Никнейм</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={session?.user?.name || 'Никнейм'} />
                            </FormControl>
                            <FormDescription>
                              Ваше отображаемое имя на сайте
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Почта</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder={session?.user?.email || 'Почта'} />
                            </FormControl>
                            <FormDescription>
                              Почта для связи с вами
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button className="flex items-center gap-2 w-full xl:w-auto" type="submit">
                        {isloading ? (
                          <>
                            Сохранить <Loading />
                          </>
                        ) : (
                          'Сохранить'
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Изменение пароля</CardTitle>
              <CardDescription>Обновите свой пароль для повышения безопасности</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Текущий пароль</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новый пароль</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Минимум 8 символов
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтвердите пароль</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="flex items-center gap-2" type="submit">
                    {isloading ? (
                      <>
                        Обновить пароль <Loading />
                      </>
                    ) : (
                      'Обновить пароль'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>Выберите, какие уведомления вы хотите получать</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email уведомления</FormLabel>
                          <FormDescription>
                            Получать уведомления о новых сообщениях и бронированиях
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Маркетинговые рассылки</FormLabel>
                          <FormDescription>
                            Получать новости и специальные предложения
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="securityAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Уведомления безопасности</FormLabel>
                          <FormDescription>
                            Получать уведомления о входе в аккаунт и изменениях безопасности
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button className="flex items-center gap-2" type="submit">
                    {isloading ? (
                      <>
                        Сохранить настройки <Loading />
                      </>
                    ) : (
                      'Сохранить настройки'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
