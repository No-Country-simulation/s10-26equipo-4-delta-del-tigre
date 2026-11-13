import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { obtenerComplejoPublicoPorSlug } from "@/services/onboarding/onboarding.service";
import { OnboardingWizard } from "./onboarding-wizard";

export const instant = false;

type Params = Promise<{ slug: string }>;

const getComplejo = cache(obtenerComplejoPublicoPorSlug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { slug } = await params;
    const complejo = await getComplejo(slug);

    return {
        title: complejo ? `Onboarding · ${complejo.nombre}` : "Onboarding",
        description: complejo
            ? `Completá tu onboarding para ingresar a ${complejo.nombre}.`
            : "Formulario de onboarding de huéspedes.",
    };
}

export default async function OnboardingPage({ params }: { params: Params }) {
    const { slug } = await params;
    const complejo = await getComplejo(slug);

    if (!complejo) notFound();

    return <OnboardingWizard complejo={complejo} />;
}
