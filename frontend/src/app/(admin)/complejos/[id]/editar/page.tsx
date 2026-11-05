import { notFound } from "next/navigation";

import { ComplejoForm } from "../../complejo-form";
import { getOwnedComplejo } from "../../data/complejos.data";

type Params = Promise<{ id: string }>;

export default async function EditarComplejoPage({ params }: { params: Params }) {
    const { id } = await params;
    const complejo = await getOwnedComplejo(id);

    if (!complejo) notFound();

    return (
        <ComplejoForm
            complejoId={complejo.id}
            initialLogo={complejo.logo}
            initialValues={{
                nombre: complejo.nombre,
                direccion: complejo.direccion,
                estadoOperativo: complejo.estadoOperativo ?? "abierto",
                slug: complejo.slug ?? "",
                coloresMarca: complejo.coloresMarca ?? "",
                minPersonas: complejo.minPersonas,
                maxPersonas: complejo.maxPersonas,
                maxReservas: complejo.maxReservas,
                titularCuenta: complejo.titularCuenta ?? "",
                aliasCbu: complejo.aliasCbu ?? "",
                banco: complejo.banco ?? "",
                cuenta: complejo.cuenta ?? "",
            }}
        />
    );
}
