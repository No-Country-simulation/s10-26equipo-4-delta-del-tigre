"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actualizarDatosPago } from "../complejos/data/complejos.data";

export async function guardarDatosPago(formData: FormData) {
    const complexId = String(
        formData.get("complexId") ?? "",
    ).trim();

    const bank = String(formData.get("bank") ?? "").trim();
    const aliasCbu = String(formData.get("aliasCbu") ?? "").trim();
    const accountHolder = String(
        formData.get("accountHolder") ?? "",
    ).trim();

    const query = `?complejo=${encodeURIComponent(complexId)}`;

    if (!complexId) {
        redirect("/cobros?error=complejo");
    }

    if (!bank || !aliasCbu || !accountHolder) {
        redirect(`/cobros${query}&error=campos`);
    }

    try {
        await actualizarDatosPago(complexId, {
            bank,
            aliasCbu,
            accountHolder,
        });
    } catch {
        redirect(`/cobros${query}&error=guardar`);
    }

    revalidatePath("/cobros");
    revalidatePath("/complejos");

    redirect(`/cobros${query}&guardado=1`);
}