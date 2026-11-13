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
            initialSlug={complejo.slug}
            initialValues={{
                nombre: complejo.nombre,
                direccion: complejo.direccion,
                logoUrl: complejo.logo ?? "",
                estadoOperativo: complejo.estadoOperativo ?? "abierto",
                coloresMarca: complejo.coloresMarca ?? "",
                titularCuenta: complejo.titularCuenta ?? "",
                aliasCbu: complejo.aliasCbu ?? "",
                banco: complejo.banco ?? "",
            }}
        />
    );
}
