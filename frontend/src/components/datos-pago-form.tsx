
"use client";

import { CreditCardIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { guardarDatosPago } from "@/app/(admin)/datos-pago/actions";

type Props = {
    complexId: string;
    banco: string | null;
    aliasCbu: string | null;
    titularCuenta: string | null;
};

export function DatosPagoForm({
    complexId,
    banco,
    aliasCbu,
    titularCuenta,
}: Props) {
    return (
        <form id="datos-pago-form" action={guardarDatosPago}>
            <input
                type="hidden"
                name="complexId"
                value={complexId}
            />

            <Card className="rounded-3xl border border-[#dce5e0] bg-white py-0 shadow-none ring-0">
                <div className="flex items-center gap-4 border-b border-[#dce5e0] p-6 md:p-8">
                    <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#e4eff3] text-[#1f6178]">
                        <CreditCardIcon className="size-5" />
                    </div>

                    <div>
                        <h2 className="text-lg font-medium text-[#172c28]">
                            Cuenta para transferencias
                        </h2>
                        <p className="text-sm text-[#71817b]">
                            Solo mostraremos estos datos al finalizar el onboarding.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 p-6 md:p-8">
                    <Campo
                        id="bank"
                        label="Banco"
                        defaultValue={banco ?? ""}
                        placeholder="Ej: Mercado Pago, Galicia, Santander"
                    />

                    <Campo
                        id="aliasCbu"
                        label="Alias o CBU"
                        defaultValue={aliasCbu ?? ""}
                        placeholder="Ej: ISLASAUCE.MP"
                    />

                    <Campo
                        id="accountHolder"
                        label="Titular de la cuenta"
                        defaultValue={titularCuenta ?? ""}
                        placeholder="Nombre y apellido o razón social"
                    />

                    <p className="rounded-xl bg-[#e4eff3] px-4 py-4 text-sm leading-relaxed text-[#1f6178]">
                        HostFlow no procesa pagos ni solicita datos de tarjetas.
                        El huésped coordina la transferencia directamente con vos.
                    </p>
                </div>
            </Card>
        </form>
    );
}

function Campo({
    id,
    label,
    ...props
}: React.ComponentProps<typeof Input> & {
    id: string;
    label: string;
}) {
    return (
        <div className="max-w-2xl space-y-2">
            <Label
                htmlFor={id}
                className="text-sm font-semibold text-[#3d4a46]"
            >
                {label}
            </Label>

            <Input
                id={id}
                name={id}
                autoComplete="off"
                className="h-14 rounded-2xl border-[#dce5e0] bg-white px-4 text-base text-[#172c28]"
                {...props}
            />
        </div>
    );
}
