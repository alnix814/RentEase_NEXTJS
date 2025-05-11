'use client';
import PropertyList from '@/components/admin/PropertyList';

export default function AdminDashboard() {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
      <div className='w-full flex items-center justify-center p-16'>
        <button className="relative overflow-hidden bg-white p-2 rounded-lg transition-all duration-300 ease-in-out group">
          <span className="relative z-10 text-white font-medium">Волшебная кнопка</span>
          <div className="absolute inset-0 bg-gradient-to-t from-sky-500 to-indigo-500 transition-opacity duration-300 ease-in-out opacity-100" />
        </button>
      </div>


      <PropertyList />
    </div>
  );
}
