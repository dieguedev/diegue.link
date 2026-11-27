'use client';

import {
  ChevronsUpDown,
  HomeIcon,
  LayoutDashboard,
  LogOut,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Auth.userMenu');
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
          className="flex gap-1 self-stretch bg-main min-w-28 max-w-32 sm:min-w-40 sm:max-w-64 px-4 justify-center items-center border-l-1 lg:ml-2 transition-[box-shadow] duration-150 ease-ui focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ring-offset-white"
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
              <span>{t('home')}</span>
            </Link>
          ) : (
            <Link href="/dashboard">
              <LayoutDashboard />
              <span>{t('dashboard')}</span>
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          <span>{t('settings')}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>
          <LogOut />
          <span>{t('logOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
