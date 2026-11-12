"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { AuthUser } from "@/types/auth.types";

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "HF";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
}

export function AdminHeader({ user }: { user: AuthUser }) {
    return (
        <header className="flex h-18 shrink-0 items-center gap-4 border-b border-[#dce5e0] bg-white px-6 md:px-10">
            <SidebarTrigger className="md:hidden" />

            <Separator
                orientation="vertical"
                className="mr-1 h-6 md:hidden"
            />


            <div className="ml-auto flex items-center gap-4">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-[#233a33]">{user.name}</p>
                    <p className="text-xs text-[#71817b]">{user.email}</p>
                </div>

                <Avatar className="size-11 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-[#e7f0eb] font-semibold text-[#174f40]">
                        {getInitials(user.name)}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
