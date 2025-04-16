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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiUser, FiLock, FiBell, FiUpload, FiMail, FiShield, FiAlertCircle } from "react-icons/fi";
import { Loader2 } from "lucide-react";

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

  const createpasswordFormSchema = z.object({
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

  const createpassword = useForm<z.infer<typeof createpasswordFormSchema>>({
    resolver: zodResolver(createpasswordFormSchema),
    defaultValues: {
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
        Toast_Custom({ errormessage: updatedUser.message, setError: () => { }, type: 'success' });
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при обновлении профиля', setError: () => { } });
      }
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении профиля', setError: () => { } });
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
          email: session?.user.email,
        }),
      });

      const Data = await response.json();

      if (Data.status === 200) {
        Toast_Custom({ errormessage: Data.message, setError: () => { }, type: 'success' });
        passwordForm.reset();
      } else {
        Toast_Custom({ errormessage: Data.message || 'Ошибка при обновлении пароля', setError: () => { } });
      }
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении пароля', setError: () => { } });
    } finally {
      setIsloading(false);
    }
  };

  const onCreatePasswordSubmit = async (values: z.infer<typeof createpasswordFormSchema>) => {
    setIsloading(true);
    
    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: values.newPassword,
          email: session?.user.email,
        }),
      });

      if (response.ok) {
        Toast_Custom({ errormessage: 'Пароль успешно создан', setError: () => { }, type: 'success' });
        createpassword.reset();
        passwordForm.reset();
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при создании пароля', setError: () => { } });
      }
      
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при создании пароля', setError: () => { } });
    } finally {
      setIsloading(false);
    }
  }

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
        Toast_Custom({ errormessage: 'Настройки уведомлений обновлены', setError: () => { }, type: 'success' });
      } else {
        const errorData = await response.json();
        Toast_Custom({ errormessage: errorData.message || 'Ошибка при обновлении настроек', setError: () => { } });
      }
    } catch {
      Toast_Custom({ errormessage: 'Произошла ошибка при обновлении настроек', setError: () => { } });
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
        Toast_Custom({ errormessage: result.error, setError: () => { } });
        return;
      } else {
        await update();
        Toast_Custom({ errormessage: result.message, setError: () => { }, type: 'success' });
      }
    }
  };

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Шапка профиля */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-md">
              <AvatarImage src={avatarPreview ? avatarPreview : session?.user?.image as string} />
              <AvatarFallback className="text-xl font-bold">{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 cursor-pointer">
              <FiUpload className="text-white opacity-0 group-hover:opacity-100 w-6 h-6" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{session?.user?.name || 'Пользователь'}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-300 mt-1">
              <FiMail className="w-4 h-4" />
              <span>{session?.user?.email || 'email@example.com'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full text-xs font-medium">
                Аккаунт активен
              </span>
              {session?.user.aPassword ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full text-xs font-medium flex items-center gap-1">
                  <FiShield className="w-3 h-3" />
                  <span>Защищен паролем</span>
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-full text-xs font-medium flex items-center gap-1">
                  <FiAlertCircle className="w-3 h-3" />
                  <span>Требуется пароль</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Основные вкладки */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 grid grid-cols-3 h-12">
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-800">
            <FiUser size={16} />
            <span>Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-800">
            <FiLock size={16} />
            <span>Пароль</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-gray-800">
            <FiBell size={16} />
            <span>Уведомления</span>
          </TabsTrigger>
        </TabsList>

        {/* Вкладка профиля */}
        <TabsContent value="profile">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardTitle>Информация профиля</CardTitle>
              <CardDescription>Обновите свои личные данные и фото профиля</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center gap-4 md:border-r md:pr-8 md:w-1/3">
                  <Avatar className="w-24 h-24 border-2 border-gray-100 dark:border-gray-700">
                    <AvatarImage src={avatarPreview ? avatarPreview : session?.user?.image as string}/>
                    <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center">
                    <label htmlFor="avatar-upload-btn" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <FiUpload size={16} />
                        <span>Загрузить фото</span>
                      </div>
                      <input
                        id="avatar-upload-btn"
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
                              <Input 
                                {...field} 
                                placeholder={session?.user?.name || 'Никнейм'} 
                                className="focus-visible:ring-blue-500 border-gray-300 dark:border-gray-600"
                              />
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
                              <Input 
                                {...field} 
                                placeholder={session?.user?.email || 'Почта'} 
                                className="focus-visible:ring-blue-500 border-gray-300 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormDescription>
                              Почта для связи с вами
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" 
                        type="submit"
                      >
                        {isloading ? (
                          <div className="flex items-center gap-2">
                            Сохранение <Loader2 className='animate-spin' />
                          </div>
                        ) : (
                          'Сохранить изменения'
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка пароля */}
        <TabsContent value="password">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            {session?.user.aPassword ? (
              <>
                <CardHeader className="bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <CardTitle className="flex items-center gap-2">
                    <FiShield className="text-green-600 dark:text-green-500" size={18} />
                    <span>Обновите пароль</span>
                  </CardTitle>
                  <CardDescription>Обновите свой пароль для повышения безопасности</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Текущий пароль</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                className="focus-visible:ring-green-500 border-gray-300 dark:border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Новый пароль</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  {...field} 
                                  className="focus-visible:ring-green-500 border-gray-300 dark:border-gray-600"
                                />
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
                                <Input 
                                  type="password" 
                                  {...field} 
                                  className="focus-visible:ring-green-500 border-gray-300 dark:border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" 
                        type="submit"
                      >
                        {isloading ? (
                          <div className="flex items-center gap-2">
                            Обновление пароля <Loader2 className='animate-spin' />
                          </div>
                        ) : (
                          'Обновить пароль'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <CardTitle className="flex items-center gap-2">
                    <FiAlertCircle className="text-yellow-600 dark:text-yellow-500" size={18} />
                    <span>Создайте пароль для учетной записи</span>
                  </CardTitle>
                  <CardDescription>
                    Сейчас у вас не установлен пароль, но вы можете это исправить
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Установка пароля добавит дополнительный уровень защиты вашему аккаунту
                    </p>
                  </div>
                  <Form {...createpassword}>
                    <form onSubmit={createpassword.handleSubmit(onCreatePasswordSubmit)} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <FormField
                          control={createpassword.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Введите пароль</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  {...field} 
                                  className="focus-visible:ring-yellow-500 border-gray-300 dark:border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createpassword.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Подтвердите пароль</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  {...field} 
                                  className="focus-visible:ring-yellow-500 border-gray-300 dark:border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800" 
                        type="submit"
                      >
                        {isloading ? (
                          <div className="flex items-center gap-2">
                            Создание пароля <Loader2 className='animate-spin' />
                          </div>
                        ) : (
                          'Создать пароль'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Вкладка уведомлений */}
        <TabsContent value="notifications">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
              <CardTitle className="flex items-center gap-2">
                <FiBell className="text-purple-600 dark:text-purple-500" size={18} />
                <span>Настройки уведомлений</span>
              </CardTitle>
              <CardDescription>Выберите, какие уведомления вы хотите получать</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                            className="data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-700"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                            className="data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-700"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="securityAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                            className="data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-700"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    className="mt-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800" 
                    type="submit"
                  >
                    {isloading ? (
                      <div className="flex items-center gap-2">
                        Сохранение настроек <Loader2 className='animate-spin' />
                      </div>
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