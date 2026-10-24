
import type { ReactNode } from "react";

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "280px",
                    "--sidebar-width-icon": "4rem",
                } as React.CSSProperties
            }
        >
            <AppSidebar />

            <SidebarInset className="min-h-dvh bg-[#f5f8f6]">
                <AdminHeader />

                <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
