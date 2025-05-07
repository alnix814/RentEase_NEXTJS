import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export default function NotAccess() {
  return (
    <div className='flex flex-col items-center p-10'>
      <Image src={'/duck_not_acces.gif'} width={215} height={215} alt=''/>
      <h1 className='m-4 text-4xl'>Доступ запрещён</h1>
      <p className='text-xl'>У вас нет прав для просмотра этой страницы или вы не авторизованы</p>
      <button className='bg-black text-white p-2 m-2 rounded-xl'><Link href="/">Вернуться на главную</Link></button>
    </div>
  );
}
