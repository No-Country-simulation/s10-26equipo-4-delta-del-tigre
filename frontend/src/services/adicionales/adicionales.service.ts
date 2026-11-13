
import { apiRequest } from "@/lib/api";
import type {
    AddonApi,
    AddonInput,
    UpdateAddonStatusInput,
} from "@/types/addons.type";

const COMPLEXES_PATH = "/api/complexes";
const ADDONS_PATH = "/api/addons";

export function fetchAddons(
    token: string,
    complexId: string,
): Promise<AddonApi[]> {
    return apiRequest<AddonApi[]>(
        `${COMPLEXES_PATH}/${encodeURIComponent(complexId)}/addons`,
        { token },
    );
}

export function createAddon(
    token: string,
    complexId: string,
    data: AddonInput,
): Promise<AddonApi> {
    return apiRequest<AddonApi>(
        `${COMPLEXES_PATH}/${encodeURIComponent(complexId)}/addons`,
        {
            method: "POST",
            token,
            body: JSON.stringify(data),
        },
    );
}

export function updateAddon(
    token: string,
    id: string,
    data: AddonInput,
): Promise<AddonApi> {
    return apiRequest<AddonApi>(
        `${ADDONS_PATH}/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            token,
            body: JSON.stringify(data),
        },
    );
}

export function updateAddonStatus(
    token: string,
    id: string,
    data: UpdateAddonStatusInput,
): Promise<AddonApi> {
    return apiRequest<AddonApi>(
        `${ADDONS_PATH}/${encodeURIComponent(id)}/status`,
        {
            method: "PATCH",
            token,
            body: JSON.stringify(data),
        },
    );
}
