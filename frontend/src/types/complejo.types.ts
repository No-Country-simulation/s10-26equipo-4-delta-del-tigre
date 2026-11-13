export interface ComplexApi {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  logoUrl: string | null;
  brandColors: string | null;
  accountHolder: string | null;
  aliasCbu: string | null;
  bank: string | null;
  open: boolean;
}

export interface CreateComplexInput {
  name: string;
  address?: string;
  accountHolder?: string;
  aliasCbu?: string;
  bank?: string;
}

export interface UpdateComplexInput {
  name: string;
  address?: string;
  brandColors?: string;
}

export interface PaymentInfoInput {
  accountHolder: string;
  aliasCbu: string;
  bank: string;
}
