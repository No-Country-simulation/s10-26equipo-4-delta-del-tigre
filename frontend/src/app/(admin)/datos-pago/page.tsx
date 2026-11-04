
import { Button } from "@/components/ui/button";
import { ComplejoSelector } from "@/components/complejo-selector";
import { DatosPagoForm } from "@/components/datos-pago-form";

export default function CobrosPage() {
    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#1f6178]">
                        Cobros
                    </p>

                    <h1 className="mt-2 text-4xl font-medium tracking-tight text-[#172c28]">
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
                    className="h-12 rounded-2xl bg-[#174f40] px-6 text-base font-semibold text-white shadow-lg shadow-[#174f40]/25 hover:bg-[#123f33]"
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
