import { redirect } from "next/navigation";

import { getOwnedComplejos } from "../../complejos/data/complejos.data";
import { AdicionalForm } from "../adicional-form";

type SearchParams = Promise<{ complejo?: string | string[] }>;

export const instant = false;

export default async function NuevoAdicionalPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const complejos = await getOwnedComplejos();
    if (complejos.length === 0) redirect("/adicionales");

    const complejoParam = typeof params.complejo === "string" ? params.complejo : undefined;
    const complejo = complejos.find((item) => item.id === complejoParam) ?? complejos[0];

    return (
        <AdicionalForm
            complejoId={complejo.id}
            complejoNombre={complejo.nombre}
        />
    );
}
