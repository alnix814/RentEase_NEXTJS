"use client";

import Image from 'next/image';
import { FiMail } from 'react-icons/fi';

export default function Verify_Request() {
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-50">
            <div className="w-[400px] min-h-[400px] rounded-xl border bg-white shadow-xl p-8 flex flex-col items-center justify-center gap-6">
                <div className="text-blue-500 mb-4">
                    <FiMail size={64} />
                </div>
                
                <Image
                    src="/logo.svg"
                    alt="logo"
                    width={60}
                    height={60}
                    className="mb-4"
                />
                
                <h1 className="text-2xl font-semibold text-gray-800 text-center">
                    Проверьте вашу почту
                </h1>
                
                <p className="text-lg text-gray-600 text-center">
                    Ссылка направлена на ваш email
                </p>
                
                <p className="text-sm text-gray-500 text-center mt-4">
                    Если вы не получили письмо, проверьте папку Спам
                </p>
            </div>
        </div>
    );
}