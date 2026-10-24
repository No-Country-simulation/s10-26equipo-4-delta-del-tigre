export default function ReservasPage() {
    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-[#28745b]">Tu actividad</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172c28]">
                    Reservas
                </h1>
                <p className="mt-2 text-[#71817b]">
                    Aquí podrás consultar y administrar las reservas de tu complejo.
                </p>
            </div>

            <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#174f40]">Próximas reservas</h2>
                <p className="mt-2 text-sm text-[#71817b]">
                    La lista de reservas estará disponible aquí.
                </p>
            </article>
        </section>
    );
}
