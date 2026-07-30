import { randomUUID } from 'node:crypto';
import { BOOKING_SLOTS } from '../constants/slots.js';
import { store } from '../data/store.js';
import { AppError } from '../utils/AppError.js';
import type {
  BookingSlot,
  Space,
  SpaceInput,
} from '../types/domain.js';

export const findSpace = (spaceId: string): Space => {
  const space = store.spaces.find((item) => item.id === spaceId);
  if (!space) throw new AppError(404, 'Space was not found.');
  return space;
};

export const getSlots = (spaceId: string, date: string): BookingSlot[] => {
  findSpace(spaceId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    throw new AppError(400, 'A date in YYYY-MM-DD format is required.');
  }

  const activeBookings = store.bookings.filter(
    (booking) =>
      booking.spaceId === spaceId &&
      booking.date === date &&
      ['pending', 'approved'].includes(booking.status),
  );

  return BOOKING_SLOTS.map((slot) => {
    const booking = activeBookings.find(
      (item) => item.startTime === slot.startTime && item.endTime === slot.endTime,
    );
    return {
      ...slot,
      status: booking?.status === 'pending' ? 'pending' : booking ? 'booked' : 'available',
      bookingId: booking?.id,
    };
  });
};

export const listSpaces = (date?: string) =>
  store.spaces
    .filter((space) => space.status === 'available')
    .map((space) => ({
      ...space,
      ...(date
        ? {
            bookedTimes: getSlots(space.id, date).filter(
              (slot) => slot.status !== 'available',
            ),
          }
        : {}),
    }));

const validateSpace = (values: SpaceInput): void => {
  if (!values.name?.trim() || !values.type?.trim() || !values.description?.trim()) {
    throw new AppError(400, 'Name, type and description are required.');
  }
  if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < 1) {
    throw new AppError(400, 'Capacity must be a positive integer.');
  }
};

export const createSpace = (values: SpaceInput): Space => {
  validateSpace(values);
  const space: Space = {
    id: randomUUID(),
    name: values.name.trim(),
    type: values.type.trim(),
    description: values.description.trim(),
    capacity: Number(values.capacity),
    image: values.image || '',
    amenities: Array.isArray(values.amenities) ? values.amenities : [],
    status: values.status === 'unavailable' ? 'unavailable' : 'available',
  };
  store.spaces.push(space);
  return space;
};

export const updateSpace = (
  spaceId: string,
  values: Partial<SpaceInput>,
): Space => {
  const current = findSpace(spaceId);
  const updated = { ...current, ...values, id: current.id };
  validateSpace(updated);
  updated.capacity = Number(updated.capacity);
  updated.status = updated.status === 'unavailable' ? 'unavailable' : 'available';
  updated.amenities = Array.isArray(updated.amenities) ? updated.amenities : [];
  Object.assign(current, updated);
  return current;
};

export const removeSpace = (spaceId: string): void => {
  findSpace(spaceId);
  const hasActiveBookings = store.bookings.some(
    (booking) =>
      booking.spaceId === spaceId && ['pending', 'approved'].includes(booking.status),
  );
  if (hasActiveBookings) {
    throw new AppError(409, 'A space with active bookings cannot be deleted.');
  }
  store.spaces = store.spaces.filter((space) => space.id !== spaceId);
};
