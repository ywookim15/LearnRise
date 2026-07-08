"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp } from "@/lib/context/app-context";

export function ProfileDropdown({ showChevron = true }: { showChevron?: boolean }) {
  const { user, logout } = useApp();
  const router = useRouter();

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9 ring-2 ring-border">
          <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {showChevron && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/settings")}>
          <User className="h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive">
          <LogOut className="h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
