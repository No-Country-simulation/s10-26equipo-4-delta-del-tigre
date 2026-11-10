import { Badge } from "@/components/ui/badge";
import { ESTADOS, type EstadoReserva } from "../lib/reservas";

const estilos: Record<EstadoReserva, { badge: string; dot: string }> = {
    pendiente: {
        badge: "bg-[#f4ece0] text-[#8a5a2b]",
        dot: "bg-[#c48a55]",
    },
    confirmada: {
        badge: "bg-[#e4eff3] text-[#1f6178]",
        dot: "bg-[#1f6178]",
    },
    finalizada: {
        badge: "bg-[#e6f1e8] text-[#356b43]",
        dot: "bg-[#4d9660]",
    },
    cancelada: {
        badge: "bg-[#f5e6e6] text-[#963f3f]",
        dot: "bg-[#c45b5b]",
    },
};

export function EstadoBadge({ estado }: { estado: EstadoReserva }) {
    const label = ESTADOS.find((e) => e.value === estado)?.label ?? estado;
    const { badge, dot } = estilos[estado];

    return (
        <Badge
            variant="secondary"
            className={`h-7 gap-2 rounded-lg px-3 text-xs font-semibold ${badge}`}
        >
            <span className={`size-1.5 rounded-full ${dot}`} />
            {label}
        </Badge>
    );
}
