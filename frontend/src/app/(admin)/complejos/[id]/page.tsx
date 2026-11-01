import Image from "next/image";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOwnedComplejo } from "../complejos.data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Params = Promise<{ id: string }>;

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-[#71817b]">{label}</dt>
            <dd className="mt-1 wrap-break-word font-medium text-[#172c28]">
        {children ?? <span className="text-[#a7b3ae]">No disponible</span>}
      </dd>
    </div>
  );
}

function MuestrasColores({ value }: { value: string | null }) {
  const colores = value
    ?.split(",")
    .map((color) => color.trim())
    .filter((color) => /^#[\da-f]{3,8}$/i.test(color));

  if (!colores?.length) {
    return <span className="text-[#a7b3ae]">No disponible</span>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {colores.map((color, index) => (
        <li
          key={`${color}-${index}`}
          className="inline-flex items-center gap-2 rounded-full border border-[#dce5e0] bg-white px-2.5 py-1 text-xs"
        >
          <span
            aria-hidden="true"
            className="size-4 rounded-full border border-black/10"
            style={{ backgroundColor: color }}
          />
          <span>{color}</span>
        </li>
      ))}
    </ul>
  );
}

export const instant = false

export default async function ComplejoDetallePage({ params }: { params: Params }) {
  const { id } = await params;
  const complejo = getOwnedComplejo(id);

  if (!complejo) notFound();

    return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Button
        nativeButton={false}
        render={<Link href="/complejos" />}
        variant="outline"
        size="lg"
        className="h-10 gap-2 rounded-lg border-[#dce5e0] bg-white px-4 text-[#526963] hover:bg-[#f5f8f6] hover:text-[#174f40]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Volver a complejos
      </Button>


      <header className="flex flex-wrap items-center gap-4">
        {complejo.logo ? (
          <Image
            src={complejo.logo}
            alt={`Logo de ${complejo.nombre}`}
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-xl object-cover"
          />
        ) : (
          <span aria-hidden="true" className="flex size-16 items-center justify-center rounded-xl bg-[#e8f1ec] text-xl font-semibold text-[#174f40]">
            {complejo.nombre.slice(0, 1).toLocaleUpperCase("es")}
          </span>
        )}
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[#172c28]">
            {complejo.nombre}
          </h1>
          <p className="mt-1 text-sm text-[#71817b]">Detalle del complejo</p>
        </div>
      </header>

      <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-[#172c28]">Identificación</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <Dato label="UUID">{complejo.id}</Dato>
            <Dato label="Nombre">{complejo.nombre}</Dato>
            <Dato label="Dueño ID">{complejo.ownerId}</Dato>
            <Dato label="Dirección">{complejo.direccion}</Dato>
            <Dato label="Logo URL">{complejo.logo}</Dato>
            <Dato label="Colores de marca">
              <MuestrasColores value={complejo.coloresMarca} />
            </Dato>
            <Dato label="Capacidad máxima">{complejo.maxPersonas}</Dato>
            <Dato label="Capacidad mínima">{complejo.minPersonas}</Dato>
            <Dato label="Máximo de reservas">{complejo.maxReservas}</Dato>
            <Dato label="Slug">{complejo.slug}</Dato>
          </dl>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-[#172c28]">Datos de pago</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <Dato label="Titular de la cuenta">{complejo.titularCuenta}</Dato>
            <Dato label="Alias / CBU">{complejo.aliasCbu}</Dato>
            <Dato label="Banco">{complejo.banco}</Dato>
            <Dato label="Número de cuenta">{complejo.cuenta}</Dato>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
