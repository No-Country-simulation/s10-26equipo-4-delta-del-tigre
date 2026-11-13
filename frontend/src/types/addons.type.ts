
export interface AddonApi {
    id: string;
    complexId: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    active: boolean;
}

export interface AddonInput {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string | null;
}

export interface UpdateAddonStatusInput {
    active: boolean;
}
