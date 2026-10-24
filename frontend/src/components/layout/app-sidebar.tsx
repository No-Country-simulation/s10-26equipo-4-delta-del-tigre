
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    House,
    CalendarDays,
    Plus,
    CreditCard,
    Link as LinkIcon,
    Mail,
    ChevronRight,
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
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const items = [
    { title: "Mi complejo", url: "/hostflow/dashboard", icon: House },
    { title: "Reservas", url: "/hostflow/reservas", icon: CalendarDays },
    { title: "Adicionales", url: "/hostflow/adicionales", icon: Plus },
    { title: "Datos de pago", url: "/hostflow/datos-pago", icon: CreditCard },
    { title: "Link de onboarding", url: "/hostflow/onboarding", icon: LinkIcon },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="none" className="border-r border-[#dce5e0]">
            <SidebarHeader className="h-22 justify-center px-6">
                <Link href="/hostflow/dashboard" className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#174f40] text-white">
                        <span className="text-xl font-bold">H</span>
                    </span>
                    <span className="text-[23px] font-bold tracking-tight text-[#174f40]">
                        HostFlow
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-4 pt-5">
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
                                            render={<Link href={item.url} />}
                                            isActive={active}
                                            className="h-14 gap-4 rounded-xl px-4 text-base text-[#526963] hover:bg-[#f6f8f7] hover:text-[#174f40] data-[active=true]:bg-[#eff6f2] data-[active=true]:font-semibold data-[active=true]:text-[#174f40]"
                                        >
                                            <item.icon className="size-5.5" />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-4 px-4 pb-4">
                <div className="rounded-2xl border border-[#eee2d1] bg-[#fcf8f2] p-5">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-white text-[#28749a]">
                        <Mail className="size-5" />
                    </div>

                    <p className="font-semibold text-[#172c28]">
                        ¿Necesitas ayuda?
                    </p>
                    <p className="mt-2 text-sm text-[#71817b]">
                        Estamos para acompañarte.
                    </p>

                    <Button
                        variant="link"
                        className="mt-3 h-auto p-0 font-semibold text-[#174f40]"

                    >
                        <a href="mailto:soporte@hostflow.com">
                            Contactar soporte
                        </a>
                    </Button>
                </div>

                <Separator className="bg-[#dce5e0]" />

                <Button
                    variant="ghost"
                    className="h-auto justify-start gap-3 px-1 py-2 hover:bg-[#f6f8f7]"
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
                        <span className="block text-xs text-[#71817b]">
                            HostFlow
                        </span>
                    </span>

                    <ChevronRight className="size-5 text-[#526963]" />
                </Button>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
