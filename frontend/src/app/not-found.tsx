import Link from "next/link";
import { Building2, LayoutDashboard, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hasMockSession } from "@/services/auth/mock-session.server";

export const instant = false;

export default async function NotFound() {
  const sessionActive = await hasMockSession();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f8f6] px-6 py-12 text-[#172c28]">
      <section className="w-full max-w-xl text-center">
        <Link
          href={sessionActive ? "/dashboard" : "/login"}
          className="inline-flex items-center justify-center gap-3"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#174f40] text-lg font-bold text-white">
            H
          </span>
          <span className="text-xl font-bold text-[#174f40]">HostFlow</span>
        </Link>

        <div className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#28745b]">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl font-semibold">No encontramos esta página</h1>
          <p className="mx-auto mt-3 max-w-md leading-6 text-[#71817b]">
            Puede que el enlace haya cambiado o que la dirección esté mal escrita.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/complejos" />}
              className="h-11 gap-2 bg-[#174f40] px-4 text-white hover:bg-[#21634f]"
            >
              <Building2 className="size-4" aria-hidden="true" />
              Volver a complejos
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard" />}
              variant="outline"
              className="h-11 gap-2 border-[#dce5e0] bg-white px-4 text-[#526963] hover:bg-[#f5f8f6]"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Ir al panel
            </Button>
            {!sessionActive ? (
              <Button
                nativeButton={false}
                render={<Link href="/login" />}
                variant="ghost"
                className="h-11 gap-2 px-4 text-[#526963] hover:bg-[#e8eeea]"
              >
                <LogIn className="size-4" aria-hidden="true" />
                Iniciar sesión
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
