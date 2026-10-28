import Link from "next/link";
import { LogIn } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f5f8f6] px-6 py-12 text-[#172c28]">
      <section className="w-full max-w-xl">
        <Link href="/login" className="inline-flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#174f40] text-lg font-bold text-white">
            H
          </span>
          <span className="text-xl font-bold text-[#174f40]">HostFlow</span>
        </Link>

        <div className="mt-16  pl-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#28745b]">
            Error 404
          </p>
          <h1 className="mt-3 text-3xl font-semibold">No encontramos esta página</h1>
          <p className="mt-3 max-w-md leading-6 text-[#71817b]">
            Puede que el enlace haya cambiado o que la dirección esté mal escrita.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-md bg-[#174f40] px-4 text-sm font-semibold text-white transition hover:bg-[#21634f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55b78e] focus-visible:ring-offset-2"
          >
            <LogIn className="size-4" aria-hidden="true" />
            Ir al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
