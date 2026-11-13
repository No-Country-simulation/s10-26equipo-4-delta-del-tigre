
import { apiRequest } from "@/lib/api";
import type {
    OnboardingInput,
    OnboardingResponse,
    PublicComplexApi,
} from "@/types/public.type";

const BASE_PATH = "/api/public/complexes";

export function fetchPublicComplex(
    slug: string,
): Promise<PublicComplexApi> {
    return apiRequest<PublicComplexApi>(
        `${BASE_PATH}/${encodeURIComponent(slug)}`,
    );
}

export function createOnboarding(
    slug: string,
    data: OnboardingInput,
): Promise<OnboardingResponse> {
    return apiRequest<OnboardingResponse>(
        `${BASE_PATH}/${encodeURIComponent(slug)}/onboarding`,
        {
            method: "POST",
            body: JSON.stringify(data),
        },
    );
}
