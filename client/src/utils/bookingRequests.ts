export type {
  BookingRequest,
  BookingStatus,
  BookingInput as NewBookingRequest,
} from '@/services/bookings.api';

import type { BookingRequest } from '@/services/bookings.api';

export const canCancelBooking = (booking: BookingRequest, now = new Date()) =>
  booking.status === 'pending' &&
  new Date(`${booking.date}T${booking.startTime}:00`).getTime() > now.getTime();
