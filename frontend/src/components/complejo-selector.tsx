"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import { Label } from "@/components/ui/label";

type Props = {
    complejos: { id: string; nombre: string }[];
    value: string;
};

export function ComplejoSelector({ complejos, value }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [pending, startTransition] = useTransition();

    return (
        <div className="space-y-2">
            <Label htmlFor="complejo" className="text-sm font-semibold text-[#3d4a46]">
                Complejo
            </Label>
            <div className="relative max-w-sm">
                <select
                    id="complejo"
                    value={value}
                    disabled={pending || complejos.length < 2}
                    onChange={(e) =>
                        startTransition(() =>
                            router.push(`${pathname}?complejo=${e.target.value}`)
                        )
                    }
                    className="h-12 w-full appearance-none rounded-2xl border border-[#dce5e0] bg-white px-4 pr-10 text-base text-[#172c28] outline-none focus-visible:ring-3 focus-visible:ring-[#1f6178]/30 disabled:opacity-70"
                >
                    {complejos.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.nombre}
                        </option>
                    ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#71817b]" />
            </div>
        </div>
    );
}