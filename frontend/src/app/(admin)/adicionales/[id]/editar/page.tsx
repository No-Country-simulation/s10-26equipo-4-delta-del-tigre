import { notFound, redirect } from "next/navigation";

import { getOwnedComplejos } from "../../../complejos/data/complejos.data";
import { AdicionalForm } from "../../adicional-form";
import { obtenerAdicional } from "../../data/adicionales.data";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ complejo?: string | string[] }>;

export const instant = false;

export default async function EditarAdicionalPage({
    params,
    searchParams,
}: {
    params: Params;
    searchParams: SearchParams;
}) {
    const { id } = await params;
    const query = await searchParams;
    const complejos = await getOwnedComplejos();
    if (complejos.length === 0) redirect("/adicionales");

    const complejoParam = typeof query.complejo === "string" ? query.complejo : undefined;
    const complejo = complejos.find((item) => item.id === complejoParam) ?? complejos[0];
    const adicional = await obtenerAdicional(complejo.id, id);

    if (!adicional) notFound();

    return (
        <AdicionalForm
            complejoId={complejo.id}
            complejoNombre={complejo.nombre}
            adicionalId={adicional.id}
            initialImage={adicional.imagen}
            initialValues={{
                nombre: adicional.nombre,
                descripcion: adicional.descripcion,
                precio: adicional.precio,
            }}
        />
    );
}
