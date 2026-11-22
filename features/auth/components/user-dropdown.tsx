'use client';

import {
  ChevronsUpDown,
  HomeIcon,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth/auth-client';

interface Props {
  username: string;
}

export function UserDropdown({ username }: Props) {
  const pathname = usePathname();
  const isInDashboard = pathname.startsWith('/dashboard');

  const handleLogOut = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          title={username}
          className="flex gap-1 self-stretch bg-main min-w-28 max-w-40 sm:min-w-40 sm:max-w-64 px-4 justify-center items-center border-l-1 lg:ml-2"
        >
          <span className="truncate">{username}</span>
          <ChevronsUpDown size={16} className="shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="truncate" title={username}>
          {username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          {isInDashboard ? (
            <Link href="/">
              <HomeIcon />
              <span>Inicio</span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <LayoutDashboard />
              <span>Dashboard</span>
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          <span>Ajustes</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>
          <LogOut />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
