import { apiRequest } from "@/lib/api";
import type {
    BookingApi,
    BookingResponseApi,
    BookingStatus,
    BookingSummaryApi,
    CreateBookingInput,
    UpdateBookingStatusInput,
} from "@/types/booking.type";

const COMPLEXES_PATH = "/api/complexes";
const BOOKINGS_PATH = "/api/bookings";

export function fetchBookings(
    token: string,
    complexId: string,
    status?: BookingStatus,
): Promise<BookingSummaryApi[]> {
    const params = new URLSearchParams();

    if (status) {
        params.set("status", status);
    }

    const query = params.toString();
    const endpoint =
        `${COMPLEXES_PATH}/${encodeURIComponent(complexId)}/bookings` +
        (query ? `?${query}` : "");

    return apiRequest<BookingSummaryApi[]>(endpoint, { token });
}

export function fetchBooking(
    token: string,
    id: string,
): Promise<BookingApi> {
    return apiRequest<BookingApi>(
        `${BOOKINGS_PATH}/${encodeURIComponent(id)}`,
        { token },
    );
}

export function createBooking(
    token: string,
    complexId: string,
    data: CreateBookingInput,
): Promise<BookingResponseApi> {
    return apiRequest<BookingResponseApi>(
        `${COMPLEXES_PATH}/${encodeURIComponent(complexId)}/bookings`,
        {
            method: "POST",
            token,
            body: JSON.stringify(data),
        },
    );
}

export function updateBookingStatus(
    token: string,
    id: string,
    data: UpdateBookingStatusInput,
): Promise<BookingResponseApi> {
    return apiRequest<BookingResponseApi>(
        `${BOOKINGS_PATH}/${encodeURIComponent(id)}/status`,
        {
            method: "PATCH",
            token,
            body: JSON.stringify(data),
        },
    );
}
