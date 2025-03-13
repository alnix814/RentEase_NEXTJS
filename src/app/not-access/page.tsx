import React from 'react';

export default function NotAccess() {
  return (
    <div className='text-center p-10'>
      <h1 className='text-5xl'>🚫</h1>
      <h1 className='m-4'>Доступ запрещён</h1>
      <p>У вас нет прав для просмотра этой страницы или вы не авторизованы</p>
      <button className='bg-black text-white p-2 m-2 rounded-xl'><a href="/">Вернуться на главную</a></button>
    </div>
  );
}
