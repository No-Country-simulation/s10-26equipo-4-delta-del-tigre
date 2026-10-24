
"use client";

import { Bell, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
    return (
        <header className="flex h-22 shrink-0 items-center gap-4 border-b border-[#dce5e0] bg-white px-6 md:px-10">
            <SidebarTrigger className="md:hidden" />

            <Separator
                orientation="vertical"
                className="mr-1 h-6 md:hidden"
            />

            <div className="relative w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[#81918b]" />

                <Input
                    placeholder="Buscar huésped o reserva..."
                    aria-label="Buscar huésped o reserva"
                    className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="ml-auto flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Notificaciones"
                    className="relative size-11 rounded-xl border-[#dce5e0]"
                >
                    <Bell className="size-5 text-[#526963]" />
                    <span className="absolute right-2 top-2 size-2 rounded-full bg-[#c58a48]" />
                </Button>

                <Avatar className="size-11 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-[#e7f0eb] font-semibold text-[#174f40]">
                        DG
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
