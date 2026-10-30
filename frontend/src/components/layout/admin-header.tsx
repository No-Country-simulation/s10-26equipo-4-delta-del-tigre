
"use client";

import { Bell, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AdminHeader() {
    return (
        <header className="flex h-18 shrink-0 items-center gap-4 border-b border-[#dce5e0] bg-white px-6 md:px-10">
            <SidebarTrigger className="md:hidden" />

            <Separator
                orientation="vertical"
                className="mr-1 h-6 md:hidden"
            />


            <div className="ml-auto flex items-center gap-4">

                <Avatar className="size-11 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-[#e7f0eb] font-semibold text-[#174f40]">
                        DG
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
