import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import {
    ETIQUETAS_ALERGIA,
    formatFecha,
    formatFechaHora,
    formatTotal,
    iniciales,
} from "@/lib/reservas";
import { getReservaById } from "../data/reservas.data";
import { VolverButton } from "@/components/volver-button";
import { EstadoBadge } from "@/components/estado-badge";

type Params = Promise<{ id: string }>;

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <dt className="text-sm text-[#71817b]">{label}</dt>
            <dd className="mt-1 font-medium text-[#172c28]">
                {children ?? <span className="text-[#a7b3ae]">No disponible</span>}
            </dd>
        </div>
    );
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
            <CardContent className="p-6">
                <h2 className="text-lg font-medium text-[#172c28]">{titulo}</h2>
                {children}
            </CardContent>
        </Card>
    );
}

export default async function ReservaDetallePage({ params }: { params: Params }) {
    const { id } = await params;
    const reserva = await getReservaById(id);

    if (!reserva) notFound();

    const tienePreferencias =
        Boolean(reserva.preferencias) ||
        reserva.alergias.length > 0 ||
        Boolean(reserva.otrasAlergias);

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <VolverButton />

            <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f4ece0] text-lg font-semibold text-[#8a5a2b]">
                        {iniciales(reserva.huesped)}
                    </span>
                    <div>
                        <h1 className="text-3xl font-medium tracking-tight text-[#172c28]">
                            {reserva.huesped}
                        </h1>
                        <p className="mt-1 text-sm text-[#71817b]">Reserva {reserva.id}</p>
                    </div>
                </div>
                <EstadoBadge estado={reserva.estado} />
            </header>

            <Bloque titulo="Detalle de la estadía">
                <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                    <Dato label="Complejo">{reserva.complejo ?? null}</Dato>
                    <Dato label="Huéspedes">
                        {reserva.personas != null
                            ? `${reserva.personas} ${reserva.personas === 1 ? "persona" : "personas"}`
                            : null}
                    </Dato>
                    <Dato label="Check-in">{formatFecha(reserva.checkIn, true)}</Dato>
                    <Dato label="Check-out">{formatFecha(reserva.checkOut, true)}</Dato>
                    <Dato label="Reserva creada">{formatFechaHora(reserva.creadaEl, true)}</Dato>
                    <Dato label="Total adicionales">
                        {reserva.totalAdicionales > 0 ? formatTotal(reserva.totalAdicionales) : null}
                    </Dato>
                </dl>
            </Bloque>

            <Bloque titulo="Huésped">
                <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                    <Dato label="Documento">
                        {reserva.identificacionTipo || reserva.identificacionNumero
                            ? [reserva.identificacionTipo, reserva.identificacionNumero]
                                .filter(Boolean)
                                .join(" ")
                            : null}
                    </Dato>
                    <Dato label="Email">{reserva.email}</Dato>
                    <Dato label="Teléfono">{reserva.telefono}</Dato>
                </dl>
            </Bloque>

            {tienePreferencias ? (
                <Bloque titulo="Preferencias y alergias">
                    <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                        <Dato label="Preferencias">{reserva.preferencias}</Dato>
                        <Dato label="Otras alergias">{reserva.otrasAlergias}</Dato>
                        <Dato label="Alergias">
                            {reserva.alergias.length > 0
                                ? reserva.alergias
                                    .map((alergia) => ETIQUETAS_ALERGIA[alergia])
                                    .join(", ")
                                : null}
                        </Dato>
                    </dl>
                </Bloque>
            ) : null}

            <Bloque titulo="Adicionales">
                {reserva.adicionales.length === 0 ? (
                    <p className="mt-4 text-sm text-[#71817b]">
                        Esta reserva no incluye adicionales.
                    </p>
                ) : (
                    <ul className="mt-4 divide-y divide-[#e8eeea]">
                        {reserva.adicionales.map((adicional) => (
                            <li
                                key={adicional.addonId}
                                className="flex items-center justify-between gap-4 py-3 text-sm"
                            >
                                <div>
                                    <p className="font-medium text-[#172c28]">
                                        {adicional.name}
                                    </p>
                                    <p className="text-[#71817b]">
                                        {adicional.quantity} × {formatTotal(adicional.unitPrice)}
                                    </p>
                                </div>
                                <span className="font-medium text-[#172c28]">
                                    {formatTotal(adicional.subtotal)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Bloque>

            <Bloque titulo="Lancha remis">
                {reserva.lanchas.length === 0 ? (
                    <p className="mt-4 text-sm text-[#71817b]">
                        El huésped no solicitó lancha remis.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-4">
                        {reserva.lanchas.map((lancha) => (
                            <li
                                key={lancha.id}
                                className="rounded-2xl border border-[#e8eeea] bg-[#f9faf9] p-4 text-sm"
                            >
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <Dato label="Salida">
                                        {formatFechaHora(lancha.departureAt)}
                                    </Dato>
                                    <Dato label="Regreso">
                                        {formatFechaHora(lancha.returnAt)}
                                    </Dato>
                                    <Dato label="Punto de salida">
                                        {lancha.pickupPoint}
                                    </Dato>
                                    <Dato label="Pasajeros">{lancha.passengers}</Dato>
                                    <Dato label="Comentarios">{lancha.comments}</Dato>
                                </dl>
                            </li>
                        ))}
                    </ul>
                )}
            </Bloque>
        </section>
    );
}
