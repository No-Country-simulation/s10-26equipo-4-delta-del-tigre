export default function DatosPagoPage() {
    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-[#28745b]">Cuenta del anfitrión</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172c28]">
                    Datos de pago
                </h1>
                <p className="mt-2 text-[#71817b]">
                    Revisa la información que se utilizará para gestionar tus pagos.
                </p>
            </div>

            <article className="rounded-2xl border border-[#dce5e0] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#174f40]">Método de pago</h2>
                <p className="mt-2 text-sm text-[#71817b]">
                    Aún no se configuró un método de pago.
                </p>
            </article>
        </section>
    );
}
