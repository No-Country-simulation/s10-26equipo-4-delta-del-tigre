
import { Suspense } from "react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { hasMockSession } from "@/services/auth/mock-session.server";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<div className="min-h-dvh bg-[#f5f8f6]" aria-busy="true" />}>
            <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
        </Suspense>
    );
}

async function AuthenticatedAdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    if (!(await hasMockSession())) {
        redirect("/login?session=expired");
    }

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

                <main className=" min-h-0 flex-1 overflow-y-auto p-6 md:p-10">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
