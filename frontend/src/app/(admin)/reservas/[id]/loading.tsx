import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReservaDetalleLoading() {
    return (
        <section
            className="mx-auto max-w-3xl space-y-6"
            role="status"
            aria-label="Cargando reserva"
        >
            <Skeleton className="h-9 w-40 rounded-xl" />

            <div className="flex items-center gap-4">
                <Skeleton className="size-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}
