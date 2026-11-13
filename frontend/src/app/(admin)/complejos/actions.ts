"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api";
import { getSessionToken } from "@/services/auth/session";
import {
  createComplex,
  updateComplex,
  updateComplexPaymentInfo,
  updateComplexStatus,
} from "@/services/complejos/complejos.service";
import type { PaymentInfoInput } from "@/types/complejo.types";
import {
  complejoFormSchema,
  type ComplejoFormValues,
} from "./schemas/complejo-form.schema";

export type ComplejoActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

const FIELD_NAMES: Record<string, string> = {
  name: "nombre",
  address: "direccion",
  brandColors: "coloresMarca",
  accountHolder: "titularCuenta",
  aliasCbu: "aliasCbu",
  bank: "banco",
  open: "estadoOperativo",
};

function mapFieldErrors(
  fieldErrors: Record<string, string>,
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [field, message] of Object.entries(fieldErrors)) {
    mapped[FIELD_NAMES[field] ?? field] = message;
  }
  return mapped;
}

function validationResult(
  issues: { path: PropertyKey[]; message: string }[],
): ComplejoActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return {
    ok: false,
    message: issues[0]?.message ?? "Revisá los datos ingresados.",
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
  };
}

function toResult(error: unknown): ComplejoActionResult {
  if (error instanceof ApiError) {
    const fieldErrors = mapFieldErrors(error.fieldErrors);
    return {
      ok: false,
      message: error.message,
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }

  return {
    ok: false,
    message:
      "No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.",
  };
}

async function sessionToken(): Promise<string> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError("Tu sesión expiró. Iniciá sesión nuevamente.", 401);
  }
  return token;
}

function paymentInfo(values: ComplejoFormValues): PaymentInfoInput | undefined {
  if (!values.titularCuenta || !values.aliasCbu || !values.banco) {
    return undefined;
  }
  return {
    accountHolder: values.titularCuenta,
    aliasCbu: values.aliasCbu,
    bank: values.banco,
  };
}

export async function crearComplejoAction(
  input: ComplejoFormValues,
): Promise<ComplejoActionResult> {
  const parsed = complejoFormSchema.safeParse(input);
  if (!parsed.success) return validationResult(parsed.error.issues);

  try {
    const token = await sessionToken();
    const values = parsed.data;
    const payment = paymentInfo(values);

    const complejo = await createComplex(token, {
      name: values.nombre,
      address: values.direccion,
      accountHolder: payment?.accountHolder,
      aliasCbu: payment?.aliasCbu,
      bank: payment?.bank,
    });

    if (values.coloresMarca) {
      await updateComplex(token, complejo.id, {
        name: values.nombre,
        address: values.direccion,
        brandColors: values.coloresMarca,
      });
    }

    if (values.estadoOperativo === "cerrado") {
      await updateComplexStatus(token, complejo.id, false);
    }

    revalidatePath("/complejos");
    return { ok: true, id: complejo.id };
  } catch (error) {
    return toResult(error);
  }
}

export async function actualizarComplejoAction(
  id: string,
  input: ComplejoFormValues,
): Promise<ComplejoActionResult> {
  const parsed = complejoFormSchema.safeParse(input);
  if (!parsed.success) return validationResult(parsed.error.issues);

  try {
    const token = await sessionToken();
    const values = parsed.data;

    await updateComplex(token, id, {
      name: values.nombre,
      address: values.direccion,
      brandColors: values.coloresMarca || undefined,
    });

    const payment = paymentInfo(values);
    if (payment) {
      await updateComplexPaymentInfo(token, id, payment);
    }

    await updateComplexStatus(token, id, values.estadoOperativo === "abierto");

    revalidatePath("/complejos");
    revalidatePath(`/complejos/${id}`);
    return { ok: true, id };
  } catch (error) {
    return toResult(error);
  }
}
