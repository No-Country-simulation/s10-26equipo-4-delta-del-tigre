import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { OnboardingWizard } from "./onboarding-wizard";
import { obtenerComplejoPublico } from "@/services/public/public.service";

export const instant = false;

type Params = Promise<{ slug: string }>;

// Evita repetir la consulta cuando generateMetadata y la página
// solicitan el mismo complejo durante el mismo render.
const getComplejo = cache(obtenerComplejoPublico);

export async function generateMetadata({
    params,
}: {
    params: Params;
}): Promise<Metadata> {
    const { slug } = await params;
    const complejo = await getComplejo(slug);

    return {
        title: complejo
            ? `Onboarding · ${complejo.nombre}`
            : "Onboarding",
        description: complejo
            ? `Completá tu onboarding para ingresar a ${complejo.nombre}.`
            : "Formulario de onboarding de huéspedes.",
    };
}

export default async function OnboardingPage({
    params,
}: {
    params: Params;
}) {
    const { slug } = await params;
    const complejo = await getComplejo(slug);

    if (!complejo) {
        notFound();
    }

    return <OnboardingWizard complejo={complejo} />;
}