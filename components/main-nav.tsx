'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle, ThemeToggleSidebar } from './layout/theme-toggle';
import Image from 'next/image';

export function MainNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-[#131f46] py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-horizontal-7-2048x665.png"
            alt="Prexun"
            width={150}
            height={50}
            className="h-12 w-auto"
          />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-white hover:text-gray-200">
            Inicio
          </Link>
          <Link
            href="/quienes-somos"
            className="text-white hover:text-gray-200"
          >
            ¿Quienes somos?
          </Link>
          <Link href="/cursos" className="text-white hover:text-gray-200">
            Cursos
          </Link>
          <Link href="/planteles" className="text-white hover:text-gray-200">
            Planteles
          </Link>
          <Link
            href="/bolsa-de-trabajo"
            className="text-white hover:text-gray-200"
          >
            Bolsa de trabajo
          </Link>
          <Link href="/plataforma" className="text-white hover:text-gray-200">
            Plataforma
          </Link>
          <Link
            href="/login"
            className="bg-white text-[#1a237e] px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
        <div className="md:hidden">
          <Link
            href="/login"
            className="bg-white text-[#1a237e] px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>

        <ThemeToggle />
      </div>
    </nav>
  );
}
