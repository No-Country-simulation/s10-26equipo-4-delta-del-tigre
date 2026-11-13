import { Suspense } from "react";
import { headers } from "next/headers";

import { ComplejoSelector } from "@/components/complejo-selector";
import { OnboardingLinks, type OnboardingLinkItem } from "@/components/onboarding-links";
import { getOwnedComplejos } from "../complejos/data/complejos.data";

function getAppOrigin(requestHeaders: Headers): string | null {
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configuredUrl) {
        try {
            return new URL(configuredUrl).origin;
        } catch {
            // Fall back to the current request host when the optional URL is invalid.
        }
    }

    const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost ?? requestHeaders.get("host");
    if (!host) return null;

    const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProtocol ?? "http";
    try {
        return new URL(`${protocol}://${host}`).origin;
    } catch {
        return null;
    }
}

async function loadOnboardingLinkItems(): Promise<{
    complejos: { id: string; nombre: string }[];
    items: OnboardingLinkItem[];
    error: string | null;
}> {
    try {
        const [complejos, requestHeaders] = await Promise.all([
            getOwnedComplejos(),
            headers(),
        ]);
        const appOrigin = getAppOrigin(requestHeaders);
        const opcionesComplejo = complejos.map(({ id, nombre }) => ({ id, nombre }));
        const items: OnboardingLinkItem[] = complejos.map((complejo) => {
            const url = complejo.slug && appOrigin
                ? new URL(`/onboarding/${encodeURIComponent(complejo.slug)}`, appOrigin).toString()
                : null;

            return {
                id: complejo.id,
                nombre: complejo.nombre,
                url,
                previewUrl: url,
            };
        });

        return { complejos: opcionesComplejo, items, error: null };
    } catch (error) {
        return {
            complejos: [],
            items: [],
            error: error instanceof Error ? error.message : "Intenta nuevamente más tarde.",
        };
    }
}

async function OnboardingLinksTable({
    searchParams,
}: {
    searchParams: Promise<{ complejo?: string | string[] }>;
}) {
    const [{ complejo: complejoParam }, data] = await Promise.all([
        searchParams,
        loadOnboardingLinkItems(),
    ]);
    if (data.error) return <OnboardingLinks items={[]} error={data.error} />;

    const requestedId = typeof complejoParam === "string" ? complejoParam : "";
    const selectedComplex = data.complejos.find(({ id }) => id === requestedId)
        ?? data.complejos[0];
    const visibleItems = selectedComplex
        ? data.items.filter(({ id }) => id === selectedComplex.id)
        : [];

    return (
        <div className="mx-auto w-full max-w-2xl space-y-5">
            {data.complejos.length > 0 ? (
                <ComplejoSelector
                    complejos={data.complejos}
                    value={selectedComplex?.id ?? ""}
                />
            ) : null}
            <OnboardingLinks items={visibleItems} />
        </div>
    );
}

export default function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ complejo?: string | string[] }>;
}) {
    return (
        <section className="mx-auto max-w-6xl space-y-6">
            <header>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f6178]">
                    Invitación
                </p>
                <h1 className="mt-2 text-3xl font-medium tracking-tight text-[#172c28]">
                    Link de onboarding
                </h1>
                <p className="mt-1 text-sm text-[#71817b]">
                    Compártelo con cada huésped antes de su llegada.
                </p>
            </header>

            <Suspense fallback={<OnboardingLinks items={[]} isLoading />}>
                <OnboardingLinksTable searchParams={searchParams} />
            </Suspense>
        </section>
    );
}
