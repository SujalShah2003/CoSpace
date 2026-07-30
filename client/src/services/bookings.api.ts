import {
  apiClient,
  type ApiResponse,
  type PaginatedResult,
} from './apiClient';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type BookingRequest = {
  id: string;
  spaceId: string;
  spaceName: string;
  memberId: string;
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
  requestedByEmail: string;
  status: BookingStatus;
  createdAt: string;
};

export type BookingInput = Pick<
  BookingRequest,
  'spaceId' | 'date' | 'startTime' | 'endTime'
>;

const asPaginatedResult = (
  data: ApiResponse<BookingRequest[]>,
): PaginatedResult<BookingRequest> => ({
  records: data.data,
  pagination: data.pagination ?? {
    page: 1,
    pageSize: data.data.length,
    total: data.data.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

export const getMyBookings = async (page = 1, pageSize = 100) => {
  const { data } = await apiClient.get<ApiResponse<BookingRequest[]>>(
    '/member/bookings',
    { params: { page, pageSize } },
  );
  return asPaginatedResult(data);
};

export const getBookingRequests = async (page = 1, pageSize = 100) => {
  const { data } = await apiClient.get<ApiResponse<BookingRequest[]>>(
    '/admin/booking-requests',
    { params: { page, pageSize } },
  );
  return asPaginatedResult(data);
};

export const createBooking = async (values: BookingInput) => {
  const { data } = await apiClient.post<ApiResponse<BookingRequest>>(
    '/member/bookings',
    values,
  );
  return data.data;
};

export const requestBooking = async (values: BookingInput) => {
  const { data } = await apiClient.post<ApiResponse<BookingRequest>>(
    '/member/booking-requests',
    values,
  );
  return data.data;
};

export const cancelBooking = async (bookingId: string) => {
  const { data } = await apiClient.patch<ApiResponse<BookingRequest>>(
    `/member/bookings/${bookingId}/cancel`,
  );
  return data.data;
};

export const reviewBooking = async (
  bookingId: string,
  status: 'approved' | 'rejected',
) => {
  const { data } = await apiClient.patch<ApiResponse<BookingRequest>>(
    `/admin/booking-requests/${bookingId}`,
    { status },
  );
  return data.data;
};
