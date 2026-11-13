
import { Button } from "@/components/ui/button";
import { ComplejoSelector } from "@/components/complejo-selector";
import { DatosPagoForm } from "@/components/datos-pago-form";
import { getOwnedComplejos } from "../complejos/data/complejos.data";
import { Suspense } from "react";
import {
    Save
} from "lucide-react";
type Props = {
    searchParams: Promise<{
        complejo?: string;
        guardado?: string;
        error?: string;
    }>;
};


export default function CobrosPage(props: Props) {
    return (
        <Suspense fallback={<div>Cargando datos de cobro...</div>}>
            <CobrosContent searchParams={props.searchParams} />
        </Suspense>
    );
}
export async function CobrosContent({ searchParams }: Props) {
    const [complejos, params] = await Promise.all([
        getOwnedComplejos(),
        searchParams,
    ]);

    const complejoSeleccionado =
        complejos.find((c) => c.id === params.complejo) ??
        complejos[0];

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

                {complejoSeleccionado && (
                    <Button

                        type="submit"
                        form="datos-pago-form"
                        size="lg"
                        className="h-10 gap-2 bg-[#28745b] px-4 text-white hover:bg-[#123f33] cursor-pointer"
                    >
                        <Save className="size-4" />
                        Guardar cambios
                    </Button>
                )}
            </header>

            {params.guardado === "1" && (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    Los datos de pago se actualizaron correctamente.
                </p>
            )}

            {params.error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {params.error === "campos"
                        ? "Completá todos los datos bancarios."
                        : params.error === "complejo"
                            ? "No se encontró el complejo seleccionado."
                            : "No se pudieron guardar los datos de pago. Intentá nuevamente."}
                </p>
            )}

            <div className="max-w-3xl space-y-6">
                {complejos.length > 0 ? (
                    <>
                        <ComplejoSelector
                            complejos={complejos.map((complejo) => ({
                                id: complejo.id,
                                nombre: complejo.slug ?? complejo.nombre,
                            }))}
                            value={complejoSeleccionado.id}
                        />

                        <DatosPagoForm
                            key={complejoSeleccionado.id}
                            complexId={complejoSeleccionado.id}
                            banco={complejoSeleccionado.banco}
                            aliasCbu={complejoSeleccionado.aliasCbu}
                            titularCuenta={complejoSeleccionado.titularCuenta}
                        />
                    </>
                ) : (
                    <p className="rounded-2xl border border-[#dce5e0] bg-white p-6 text-sm text-[#71817b]">
                        Todavía no tenés complejos registrados. Creá un complejo para configurar sus datos de pago.
                    </p>
                )}
            </div>
        </section>
    );
}


