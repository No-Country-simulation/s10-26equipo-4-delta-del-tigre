"use client";

import { Button } from "@/components/ui/button";

export default function AdicionalesError({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    return (
        <section
            className="mx-auto flex min-h-72 max-w-6xl flex-col items-center justify-center rounded-lg border border-[#e7c9c3] bg-white px-6 py-12 text-center"
            role="alert"
        >
            <h1 className="text-xl font-semibold text-[#172c28]">
                No pudimos cargar tus adicionales
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#71817b]">
                Hubo un problema al consultar los servicios del complejo. Intenta nuevamente.
            </p>
            {error.digest ? (
                <p className="mt-2 text-xs text-[#899791]">Referencia: {error.digest}</p>
            ) : null}
            <Button
                type="button"
                onClick={retry}
                className="mt-5 bg-[#174f40] text-white hover:bg-[#123f33]"
            >
                Reintentar
            </Button>
        </section>
    );
}
