import { Badge } from "@/components/ui/badge";
import { ESTADOS, type EstadoReserva } from "../lib/reservas";

const estilos: Record<EstadoReserva, { badge: string; dot: string }> = {
    pendiente: { badge: "bg-[#f4ece0] text-[#8a5a2b]", dot: "bg-[#c48a55]" },
    onboarding_completo: { badge: "bg-[#e4eff3] text-[#1f6178]", dot: "bg-[#1f6178]" },
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
