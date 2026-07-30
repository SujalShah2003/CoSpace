import { randomUUID } from 'node:crypto';
import { store } from '../data/store.js';
import { AppError } from '../utils/AppError.js';
import { findSpace, getSlots } from './space.service.js';
import type {
  Booking,
  BookingInput,
  BookingStatus,
  User,
} from '../types/domain.js';

export const listBookings = (user: User): Booking[] =>
  user.role === 'admin'
    ? store.bookings
    : store.bookings.filter((booking) => booking.memberId === user.id);

export const createBooking = (
  values: BookingInput,
  user: User,
  status: Extract<BookingStatus, 'pending' | 'approved'> = 'pending',
): Booking => {
  const space = findSpace(values.spaceId);
  if (space.status !== 'available') {
    throw new AppError(409, 'This space is currently unavailable.');
  }

  const slot = getSlots(values.spaceId, values.date).find(
    (item) => item.startTime === values.startTime && item.endTime === values.endTime,
  );
  if (!slot) throw new AppError(400, 'Select one of the supported booking slots.');
  if (slot.status !== 'available') {
    throw new AppError(409, 'This slot is no longer available.');
  }
  if (new Date(`${values.date}T${slot.startTime}:00`).getTime() <= Date.now()) {
    throw new AppError(400, 'Bookings must start in the future.');
  }

  const booking = {
    id: randomUUID(),
    spaceId: space.id,
    spaceName: space.name,
    memberId: user.id,
    requestedBy: user.name,
    requestedByEmail: user.email,
    date: values.date,
    slot: slot.label,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  store.bookings.push(booking);
  return booking;
};

export const cancelBooking = (bookingId: string, user: User): Booking => {
  const booking = store.bookings.find((item) => item.id === bookingId);
  if (!booking) throw new AppError(404, 'Booking was not found.');
  if (booking.memberId !== user.id && user.role !== 'admin') {
    throw new AppError(403, 'You can only cancel your own bookings.');
  }
  if (!['pending', 'approved'].includes(booking.status)) {
    throw new AppError(409, 'Only pending or approved bookings can be cancelled.');
  }
  const startsAt = new Date(`${booking.date}T${booking.startTime}:00`);
  if (startsAt.getTime() <= Date.now()) {
    throw new AppError(409, 'Past or started bookings cannot be cancelled.');
  }
  booking.status = 'cancelled';
  return booking;
};

export const reviewBooking = (
  bookingId: string,
  status: Extract<BookingStatus, 'approved' | 'rejected'>,
  admin: User,
): Booking => {
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError(400, 'Status must be approved or rejected.');
  }
  const booking = store.bookings.find((item) => item.id === bookingId);
  if (!booking) throw new AppError(404, 'Booking request was not found.');
  if (booking.status !== 'pending') {
    throw new AppError(409, 'Only pending requests can be reviewed.');
  }

  if (status === 'approved') {
    const conflict = store.bookings.some(
      (item) =>
        item.id !== booking.id &&
        item.spaceId === booking.spaceId &&
        item.date === booking.date &&
        item.startTime === booking.startTime &&
        item.endTime === booking.endTime &&
        item.status === 'approved',
    );
    if (conflict) throw new AppError(409, 'This slot already has an approved booking.');
  }

  booking.status = status;
  booking.reviewedAt = new Date().toISOString();
  booking.reviewedBy = admin.id;
  return booking;
};
