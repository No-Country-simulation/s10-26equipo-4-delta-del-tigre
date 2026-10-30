"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ESTADOS } from "../lib/reservas";

const TODOS = "todos";

const ITEMS = [{ value: TODOS, label: "Todos los estados" }, ...ESTADOS];

export function ReservasFiltros() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const qActual = searchParams.get("q") ?? "";
    const estadoActual = searchParams.get("estado") ?? TODOS;

    const [q, setQ] = useState(qActual);

    function actualizar(cambios: Record<string, string | null>) {
        const params = new URLSearchParams(searchParams.toString());
        for (const [clave, valor] of Object.entries(cambios)) {
            if (valor) params.set(clave, valor);
            else params.delete(clave);
        }
        const qs = params.toString();
        startTransition(() => {
            router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        });
    }

    // Búsqueda por nombre con debounce
    useEffect(() => {
        if (q.trim() === qActual) return;
        const t = setTimeout(() => actualizar({ q: q.trim() || null }), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const hayFiltros = q !== "" || estadoActual !== TODOS;

    return (
        <div className="flex w-full flex-wrap items-center gap-2">
            <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71817b]" />
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar huésped..."
                    aria-label="Buscar por nombre del huésped"
                    className="h-11 w-auto lg:w-3xl rounded-xl border-[#dce5e0] bg-[#f7f9f8] pl-9"
                />
            </div>

            <Select
                value={estadoActual}
                items={ITEMS}
                onValueChange={(valor) =>
                    actualizar({ estado: !valor || valor === TODOS ? null : valor })
                }
            >
                <SelectTrigger
                    aria-label="Filtrar por estado"
                    className="h-11 w-48 rounded-xl border-[#dce5e0] bg-[#f7f9f8]"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hayFiltros && (
                <Button
                    variant="ghost"
                    className="h-11 rounded-xl text-[#71817b]"
                    onClick={() => {
                        setQ("");
                        actualizar({ q: null, estado: null });
                    }}
                >
                    <XIcon className="size-4" />
                    Limpiar
                </Button>
            )}

            <Loader2Icon
                aria-hidden={!isPending}
                className={`size-4 animate-spin text-[#71817b] transition-opacity ${isPending ? "opacity-100" : "opacity-0"
                    }`}
            />
            <span className="sr-only" role="status">
                {isPending ? "Actualizando resultados" : ""}
            </span>
        </div>
    );
}
