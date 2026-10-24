export default function DashboardPage() {
    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-[#28745b]">Panel de administración</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172c28]">
                    Mi complejo
                </h1>
                <p className="mt-2 text-[#71817b]">
                    Vista de prueba para navegar por las secciones de HostFlow.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                    <p className="text-sm text-[#71817b]">Complejo</p>
                    <h2 className="mt-2 text-xl font-semibold text-[#174f40]">
                        Complejo de prueba
                    </h2>
                    <p className="mt-2 text-sm text-[#526963]">
                        Tus espacios y servicios aparecerán en esta sección.
                    </p>
                </article>
                <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                    <p className="text-sm text-[#71817b]">Estado de publicación</p>
                    <p className="mt-2 text-xl font-semibold text-[#174f40]">
                        En configuración
                    </p>
                    <p className="mt-2 text-sm text-[#526963]">
                        Completa tus datos para preparar tu espacio.
                    </p>
                </article>
            </div>
        </section>
    );
}
