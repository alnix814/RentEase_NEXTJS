import Link from "next/link";
import Image from "next/image";

export default function Loading() {
    return (
        <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="flex flex-col justify-center items-center">
                <Image src={'/duck_not_access.gif'} width={215} height={215} alt=""></Image>
                <p className="text-base font-semibold text-black">404</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Страница не найдена</h1>
                <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">Извините, мы не смогли найти страницу, которую вы ищете.</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/" className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 duration-300">Вернуться на главную</Link>
                </div>
            </div>
        </main>
    );
}