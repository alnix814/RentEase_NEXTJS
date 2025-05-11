import Link from "next/link";
import Image from "next/image";
import { FaVk } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="RentEase Logo" width={40} height={40} />
              <span className="font-bold text-xl">RentEase</span>
            </Link>
            <p className="mt-4 text-gray-600">
              Удобный сервис для поиска и аренды жилья
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 hover:text-black">Главная</Link></li>
              <li><Link href="/properties" className="text-gray-600 hover:text-black">Объекты</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-black">О нас</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-black">Контакты</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-600 hover:text-black">Условия использования</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-black">Политика конфиденциальности</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Контакты</h3>
            <p className="text-gray-600">support@rentease.com</p>
            <p className="text-gray-600">+7 (800) 123-45-67</p>
          </div>

          <div className="flex gap-2">
            <Link href={'https://vk.com/naishodesu'}><FaVk size={30}/></Link>
            <Link href={'https://github.com/alnix814'}><FaGithub size={30}/></Link>
            <Link href={'https://t.me/akqqqw'}><BsTelegram size={30}/></Link>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} RentEase. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}