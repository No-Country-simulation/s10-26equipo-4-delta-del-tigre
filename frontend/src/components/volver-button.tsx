"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

// Usa el historial para volver al listado con los mismos filtros (?q=&estado=).
// Si la persona entró directo al detalle (sin historial), va a /reservas.
export function VolverButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            className="-ml-3 rounded-xl text-[#71817b]"
            onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/reservas");
            }}
        >
            <ArrowLeftIcon className="size-4" />
            Volver a reservas
        </Button>
    );
}
