import { apiRequest } from "@/lib/api";
import type {
  ComplexApi,
  CreateComplexInput,
  PaymentInfoInput,
  UpdateComplexInput,
} from "@/types/complejo.types";

const BASE_PATH = "/api/complexes";

export function fetchComplexes(token: string): Promise<ComplexApi[]> {
  return apiRequest<ComplexApi[]>(BASE_PATH, { token });
}

export function fetchComplex(token: string, id: string): Promise<ComplexApi> {
  return apiRequest<ComplexApi>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    token,
  });
}

export function createComplex(
  token: string,
  data: CreateComplexInput,
): Promise<ComplexApi> {
  return apiRequest<ComplexApi>(BASE_PATH, {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateComplex(
  token: string,
  id: string,
  data: UpdateComplexInput,
): Promise<ComplexApi> {
  return apiRequest<ComplexApi>(`${BASE_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function updateComplexPaymentInfo(
  token: string,
  id: string,
  data: PaymentInfoInput,
): Promise<ComplexApi> {
  return apiRequest<ComplexApi>(
    `${BASE_PATH}/${encodeURIComponent(id)}/payment-info`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    },
  );
}

export function updateComplexStatus(
  token: string,
  id: string,
  open: boolean,
): Promise<ComplexApi> {
  return apiRequest<ComplexApi>(`${BASE_PATH}/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ open }),
  });
}
