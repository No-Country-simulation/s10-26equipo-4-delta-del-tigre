
import { Button } from "@/components/ui/button";
import { ComplejoSelector } from "@/components/complejo-selector";
import { DatosPagoForm } from "@/components/datos-pago-form";

export default function CobrosPage() {
    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-start justify-between gap-4 sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6178]">
                        Cobros
                    </p>

                    <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#172c28] sm:text-4xl">
                        Datos de pago
                    </h1>

                    <p className="mt-2 text-[#71817b]">
                        Definí la cuenta donde tus huéspedes transferirán sus adicionales.
                    </p>
                </div>

                <Button
                    type="submit"
                    form="datos-pago-form"
                    size="lg"
                    className="h-12 w-full rounded-2xl bg-[#174f40] px-6 text-base font-semibold text-white shadow-lg shadow-[#174f40]/25 hover:bg-[#123f33] sm:w-auto"
                >
                    Guardar cambios
                </Button>
            </header>

            <div className="max-w-3xl space-y-6">
                <ComplejoSelector
                    complejos={[
                        { id: "1", nombre: "Complejo Los Sauces" },
                        { id: "2", nombre: "Cabañas del Río" },
                    ]}
                    value="1"
                />

                <DatosPagoForm />
            </div>
        </section>
    );
}
