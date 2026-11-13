"use client";

export default function OnboardingError({ reset }: { reset: () => void }) {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-[#f7f4ec] px-6 py-12 text-[#172c28]">
            <section className="w-full max-w-md text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a33c2f]">
                    Algo salió mal
                </p>
                <h1 className="mt-2 text-2xl font-semibold">
                    No pudimos cargar el onboarding
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#71817b]">
                    Revisá tu conexión e intentá nuevamente.
                </p>
                <button
                    type="button"
                    onClick={reset}
                    className="mt-7 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-[#174f40] px-5 text-sm font-semibold text-white transition hover:bg-[#123f33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28745b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ec]"
                >
                    Reintentar
                </button>
            </section>
        </main>
    );
}
