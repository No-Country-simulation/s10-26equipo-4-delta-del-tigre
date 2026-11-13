"use server";

import { ApiError } from "@/lib/api";
import {
    enviarOnboarding,
    type OnboardingPayload,
    type OnboardingResultado,
} from "@/services/public/public.service";

type EnviarOnboardingResult =
    | { ok: true; data: OnboardingResultado }
    | { ok: false; message: string };

export async function enviarOnboardingAction(
    slug: string,
    payload: OnboardingPayload,
): Promise<EnviarOnboardingResult> {
    try {
        const data = await enviarOnboarding(slug, payload);
        return { ok: true, data };
    } catch (error) {
        return {
            ok: false,
            message:
                error instanceof ApiError
                    ? error.message
                    : "No se pudo enviar el onboarding. Intentá nuevamente.",
        };
    }
}
