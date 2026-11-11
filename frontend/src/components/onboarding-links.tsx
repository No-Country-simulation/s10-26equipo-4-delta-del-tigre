"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Link2, Share2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export type OnboardingLinkItem = {
    id: string;
    nombre: string;
    url: string | null;
    previewUrl?: string | null;
};

type OnboardingLinksProps = {
    items: OnboardingLinkItem[];
    isLoading?: boolean;
    error?: string | null;
    onRetry?: () => void;
};

export function OnboardingLinks({
    items,
    isLoading = false,
    error = null,
    onRetry,
}: OnboardingLinksProps) {
    const [copyResult, setCopyResult] = useState<{
        id: string;
        message: string;
        failed: boolean;
    } | null>(null);

    async function copyLink(item: OnboardingLinkItem) {
        if (!item.url) return;

        try {
            await navigator.clipboard.writeText(item.url);
            setCopyResult({
                id: item.id,
                message: `Enlace de ${item.nombre} copiado.`,
                failed: false,
            });
        } catch {
            setCopyResult({
                id: item.id,
                message: `No se pudo copiar el enlace de ${item.nombre}. Cópialo manualmente.`,
                failed: true,
            });
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#dce5e0] bg-white px-5 py-12 sm:px-10" aria-busy="true">
                <div className="mx-auto flex max-w-md flex-col items-center text-center" aria-hidden="true">
                    <div className="size-14 animate-pulse rounded-2xl bg-[#f5efe4]" />
                    <div className="mt-6 h-2 w-32 animate-pulse rounded bg-[#e8eeea]" />
                    <div className="mt-4 h-6 w-72 max-w-full animate-pulse rounded bg-[#f0f4f1]" />
                    <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-[#f0f4f1]" />
                    <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-[#f0f4f1]" />
                </div>
                <p className="sr-only">Cargando enlace de onboarding...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 rounded-xl border border-[#e7c9c3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <div className="flex items-start gap-3">
                    <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#9a483e]" />
                    <div>
                        <h2 className="font-semibold text-[#172c28]">No se pudieron cargar los enlaces</h2>
                        <p className="mt-1 text-sm text-[#71817b]">{error}</p>
                    </div>
                </div>
                {onRetry ? (
                    <Button type="button" variant="outline" onClick={onRetry}>
                        Reintentar
                    </Button>
                ) : null}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl border border-dashed border-[#cbd8d1] bg-white px-6 py-14 text-center">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f5efe4] text-[#174f40]">
                    <Link2 aria-hidden="true" className="size-5" />
                </span>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f6178]">
                    Invitación
                </p>
                <h2 className="mt-3 text-xl font-medium text-[#172c28]">Todavía no hay complejos</h2>
                <p className="mt-1 max-w-sm text-sm text-[#71817b]">
                    Cuando registres un complejo, su enlace para compartir aparecerá aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-5">
            {items.map((item) => {
                const previewUrl = item.previewUrl ?? item.url;
                const result = copyResult?.id === item.id ? copyResult : null;
                const shareText = `Te comparto el enlace de ${item.nombre}: ${item.url}`;
                const whatsappUrl = item.url
                    ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
                    : null;

                return (
                    <article
                        key={item.id}
                        className="rounded-2xl border border-[#dce5e0] bg-white px-5 py-10 text-center sm:px-10 sm:py-11"
                    >
                        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f5efe4] text-[#176451]">
                            <Link2 aria-hidden="true" className="size-7" />
                        </div>
                        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1f6178]">
                            Link único de {item.nombre}
                        </p>
                        <h2 className="mt-3 text-xl font-medium leading-snug text-[#172c28] sm:text-2xl">
                            Todo listo para recibir a tus huéspedes
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71817b]">
                            Este enlace refleja tu marca, adicionales y datos de pago actuales.
                        </p>

                        <div className="mx-auto mt-6 flex w-full max-w-md items-center gap-2 rounded-lg border border-[#dce5e0] p-2 text-left">
                            <span className="min-w-0 flex-1 truncate px-2 text-xs font-semibold text-[#172c28] sm:text-sm">
                                {item.url ?? "Este complejo todavía no tiene un enlace público."}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!item.url}
                                onClick={() => void copyLink(item)}
                                aria-label={`Copiar enlace de ${item.nombre}`}
                                className="h-9 shrink-0 gap-2 border-transparent bg-[#f4f7f5] px-3 text-[#174f40] hover:bg-[#e8f1ec]"
                            >
                                {result && !result.failed ? (
                                    <Check aria-hidden="true" className="size-4" />
                                ) : (
                                    <Copy aria-hidden="true" className="size-4" />
                                )}
                                Copiar
                            </Button>
                        </div>

                        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                            <Button
                                type="button"
                                nativeButton={false}
                                render={whatsappUrl ? (
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
                                ) : undefined}
                                disabled={!whatsappUrl}
                                className="h-10 gap-2 bg-[#159463] px-4 text-white hover:bg-[#117b53]"
                            >
                                Compartir por WhatsApp
                                <Share2 aria-hidden="true" className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                nativeButton={false}
                                render={previewUrl ? (
                                    <a href={previewUrl} target="_blank" rel="noopener" />
                                ) : undefined}
                                disabled={!previewUrl}
                                variant="outline"
                                aria-label={`Vista previa de ${item.nombre}`}
                                className="h-10 gap-2 border-[#dce5e0] px-4 text-[#174f40] hover:bg-[#f4f7f5]"
                            >
                                Vista previa
                                <ExternalLink aria-hidden="true" className="size-4" />
                            </Button>
                        </div>

                        <p
                            className={`mt-4 min-h-5 text-xs ${result?.failed ? "text-[#9a483e]" : "text-[#28745b]"}`}
                            aria-live="polite"
                            role={result?.failed ? "alert" : "status"}
                        >
                            {result?.message ?? " "}
                        </p>
                    </article>
                );
            })}
        </div>
    );
}
