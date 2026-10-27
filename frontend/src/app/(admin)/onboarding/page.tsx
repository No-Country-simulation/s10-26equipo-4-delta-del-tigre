export default function OnboardingPage() {
    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-[#28745b]">Comparte tu espacio</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172c28]">
                    Link de onboarding
                </h1>
                <p className="mt-2 text-[#71817b]">
                    Envía este enlace de prueba para iniciar la configuración del complejo.
                </p>
            </div>

            <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#174f40]">Enlace de invitación</h2>
                <p className="mt-3 break-all rounded-lg bg-[#f5f8f6] px-4 py-3 text-sm text-[#526963]">
                    https://hostflow.example.com/onboarding/complejo-de-prueba
                </p>
            </article>
        </section>
    );
}
