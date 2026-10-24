export default function AdicionalesPage() {
    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-[#28745b]">Servicios de tu complejo</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172c28]">
                    Adicionales
                </h1>
                <p className="mt-2 text-[#71817b]">
                    Configura opciones extra para ofrecer durante una estadía.
                </p>
            </div>

            <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#174f40]">Tus adicionales</h2>
                <p className="mt-2 text-sm text-[#71817b]">
                    Todavía no agregaste servicios adicionales.
                </p>
            </article>
        </section>
    );
}
