"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    House,
    CalendarDays,
    Plus,
    CreditCard,
    Link as LinkIcon,
    ChevronRight,
    LogOut,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";


const items = [
    { title: "Mi complejo", url: "/dashboard", icon: House },
    { title: "Reservas", url: "/reservas", icon: CalendarDays },
    { title: "Adicionales", url: "/adicionales", icon: Plus },
    { title: "Datos de pago", url: "/datos-pago", icon: CreditCard },
    { title: "Link de onboarding", url: "/onboarding", icon: LinkIcon },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { setOpenMobile, isMobile } = useSidebar();
    const router = useRouter();
    return (
        <Sidebar className="border-r border-[#dce5e0]">
            <SidebarHeader className="h-16 justify-center px-4 lg:h-22 lg:px-6">
                <Link
                    href="/dashboard"
                    onClick={() => setOpenMobile(false)}
                    className="flex items-center gap-3"
                >
                    <span className="flex size-9 items-center justify-center rounded-xl bg-[#174f40] text-white lg:size-10">
                        <span className="text-lg font-bold lg:text-xl">H</span>
                    </span>
                    <span className="text-xl font-bold tracking-tight text-[#174f40] lg:text-[23px]">
                        HostFlow
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 pt-3 lg:px-4 lg:pt-5">
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {items.map((item) => {
                                const active =
                                    pathname === item.url ||
                                    pathname.startsWith(`${item.url}/`);

                                return (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            render={
                                                <Link
                                                    href={item.url}
                                                    onClick={() => setOpenMobile(false)}
                                                />
                                            }
                                            isActive={active}
                                            className="h-12 gap-3 rounded-xl px-3 text-base text-[#526963] hover:bg-[#f6f8f7] hover:text-[#174f40] data-[active=true]:bg-[#eff6f2] data-[active=true]:font-semibold data-[active=true]:text-[#174f40] lg:h-14 lg:gap-4 lg:px-4"
                                        >
                                            <item.icon className="size-5" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-3 pb-4 lg:px-4">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="h-auto w-full justify-start gap-3 px-1 py-2 hover:bg-[#f6f8f7] cursor-pointer"
                            />
                        }
                    >
                        <Avatar className="size-10 rounded-xl">
                            <AvatarFallback className="rounded-xl bg-[#174f40] text-white">
                                DG
                            </AvatarFallback>
                        </Avatar>

                        <span className="min-w-0 flex-1 text-left">
                            <span className="block truncate text-sm font-semibold text-[#233a33]">
                                Administrador
                            </span>
                            <span className="block text-xs text-[#71817b]">HostFlow</span>
                        </span>

                        <ChevronRight className="size-5 text-[#526963]" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        side={isMobile ? "top" : "right"}
                        align="end"
                        className="w-56"
                    >
                        <DropdownMenuItem
                            onClick={() => {
                                //implementacion de logout

                                router.push("/login")
                            }}
                            className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <LogOut className="size-4" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}