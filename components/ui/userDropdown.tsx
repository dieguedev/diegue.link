'use client';

import { ChevronsUpDown, HomeIcon, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { authClient } from '@/lib/auth/auth-client';

interface Props {
  username: string;
}

export function UserDropdown({ username }: Props) {
  const handleLogOut = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex gap-1 bg-main min-h-[10dvh] min-w-[20dvh] max-w-[20px] justify-center items-center border-l-1 lg:ml-2">
          {username} <ChevronsUpDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <HomeIcon />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>
          <LogOut />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
