export class OnboardingApiError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly payload: unknown,
	) {
		super(message);
		this.name = "OnboardingApiError";
	}
}

export type PublicOnboardingComplex = {
	id: string;
	name: string;
	slug: string;
	address: string;
	logoUrl: string | null;
	brandColors: string | null;
	addons: {
		id: string;
		name: string;
		description: string | null;
		price: number;
	}[];
	open: boolean | null;
};

export type OnboardingRequest = {
	guestName: string;
	guestEmail: string;
	guestPhone?: string | null;
	guestIdentificationType?: string | null;
	guestIdentificationNumber?: string | null;
	checkIn: string;
	checkOut: string;
	guestsCount: number;
	preferences?: string | null;
	allergies?: (
		| "GLUTEN"
		| "LACTOSA"
		| "MANI"
		| "FRUTOS_SECOS"
		| "HUEVO"
		| "SOJA"
		| "MARISCOS"
		| "PESCADO"
	)[];
	otherAllergies?: string | null;
	addons?: { addonId: string; quantity: number }[];
	boat?: {
		departureAt: string;
		returnAt: string;
		passengers: number;
		pickupPoint?: string | null;
		comments?: string | null;
	} | null;
};

export type OnboardingResponse = {
	bookingId: string;
	status: string;
	total: number;
	boatRequested: boolean;
	paymentInfo: {
		accountHolder: string | null;
		aliasCbu: string | null;
		bank: string | null;
	} | null;
};

function getApiUrl() {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
	if (!apiUrl) {
		throw new Error("NEXT_PUBLIC_API_URL no esta configurada.");
	}

	let parsedUrl: URL;
	try {
		parsedUrl = new URL(apiUrl);
	} catch {
		throw new Error("NEXT_PUBLIC_API_URL debe ser una URL completa con http:// o https://.");
	}

	if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
		throw new Error("NEXT_PUBLIC_API_URL debe usar http:// o https://.");
	}

	return apiUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapData(payload: unknown): unknown {
	return isRecord(payload) && "data" in payload ? payload.data : payload;
}

function getErrorMessage(payload: unknown, fallback: string): string {
	if (!isRecord(payload)) return fallback;
	if (typeof payload.message === "string" && payload.message.trim()) {
		return payload.message;
	}
	if (typeof payload.error === "string" && payload.error.trim()) {
		return payload.error;
	}
	return fallback;
}

async function requestApi(path: string, init?: RequestInit): Promise<unknown> {
	const response = await fetch(`${getApiUrl()}${path}`, {
		...init,
		headers: {
			Accept: "application/json",
			...(init?.body ? { "Content-Type": "application/json" } : {}),
			...init?.headers,
		},
		cache: "no-store",
	});
	const payload: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new OnboardingApiError(
			getErrorMessage(payload, `La solicitud de onboarding fallo (${response.status}).`),
			response.status,
			payload,
		);
	}

	return unwrapData(payload);
}

function parsePublicComplex(payload: unknown): PublicOnboardingComplex {
	if (!isRecord(payload)
		|| typeof payload.id !== "string"
		|| typeof payload.name !== "string"
		|| typeof payload.slug !== "string"
		|| typeof payload.address !== "string"
		|| !Array.isArray(payload.addons)) {
		throw new Error("La API devolvio un complejo publico con un formato no valido.");
	}

	const addons = payload.addons.map((addon) => {
		if (!isRecord(addon)
			|| typeof addon.id !== "string"
			|| typeof addon.name !== "string"
			|| typeof addon.price !== "number") {
			throw new Error("La API devolvio un adicional con un formato no valido.");
		}

		return {
			id: addon.id,
			name: addon.name,
			description: typeof addon.description === "string" ? addon.description : null,
			price: addon.price,
		};
	});

	return {
		id: payload.id,
		name: payload.name,
		slug: payload.slug,
		address: payload.address,
		logoUrl: typeof payload.logoUrl === "string" ? payload.logoUrl : null,
		brandColors: typeof payload.brandColors === "string" ? payload.brandColors : null,
		addons,
		open: typeof payload.open === "boolean" ? payload.open : null,
	};
}

function parseOnboardingResponse(payload: unknown): OnboardingResponse {
	if (!isRecord(payload)
		|| typeof payload.bookingId !== "string"
		|| typeof payload.status !== "string"
		|| typeof payload.total !== "number"
		|| typeof payload.boatRequested !== "boolean") {
		throw new Error("La API devolvio una respuesta de onboarding con un formato no valido.");
	}

	const paymentInfo = isRecord(payload.paymentInfo)
		? {
			accountHolder: typeof payload.paymentInfo.accountHolder === "string"
				? payload.paymentInfo.accountHolder
				: null,
			aliasCbu: typeof payload.paymentInfo.aliasCbu === "string"
				? payload.paymentInfo.aliasCbu
				: null,
			bank: typeof payload.paymentInfo.bank === "string"
				? payload.paymentInfo.bank
				: null,
		}
		: null;

	return {
		bookingId: payload.bookingId,
		status: payload.status,
		total: payload.total,
		boatRequested: payload.boatRequested,
		paymentInfo,
	};
}

export async function obtenerComplejoPublicoApi(slug: string): Promise<PublicOnboardingComplex> {
	if (!slug.trim()) throw new Error("El slug del complejo es obligatorio.");

	const payload = await requestApi(
		`/api/v1/public/complexes/${encodeURIComponent(slug)}`,
	);
	return parsePublicComplex(payload);
}

export async function crearOnboardingApi(
	slug: string,
	request: OnboardingRequest,
): Promise<OnboardingResponse> {
	if (!slug.trim()) throw new Error("El slug del complejo es obligatorio.");

	const payload = await requestApi(
		`/api/v1/public/complexes/${encodeURIComponent(slug)}/onboarding`,
		{
			method: "POST",
			body: JSON.stringify(request),
		},
	);
	return parseOnboardingResponse(payload);
}
