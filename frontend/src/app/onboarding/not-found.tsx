import Link from "next/link";

export default function OnboardingNotFound() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#f7f4ec] px-6 py-12 text-[#172c28]">
            <section className="w-full max-w-md text-center">
                <span
                    aria-hidden="true"
                    className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#174f40] text-lg font-semibold text-white"
                >
                    H
                </span>
                <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-[#174f40]">
                    Enlace no disponible
                </p>
                <h1 className="mt-2 text-2xl font-semibold">
                    No encontramos este complejo
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#71817b]">
                    El enlace de onboarding puede haber cambiado o el complejo ya no está
                    disponible. Pedile un nuevo enlace al alojamiento.
                </p>
                <Link
                    href="/"
                    className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-[#174f40] px-5 text-sm font-semibold text-white transition hover:bg-[#123f33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28745b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ec]"
                >
                    Volver al inicio
                </Link>
            </section>
        </main>
    );
}
