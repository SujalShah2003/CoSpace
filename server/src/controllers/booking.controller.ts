import * as bookingService from '../services/booking.service.js';
import type { Request, Response } from 'express';
import type { BookingInput, User } from '../types/domain.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { paginate, parsePagination } from '../utils/pagination.js';

type BookingParams = { bookingId: string };
type ReviewBody = { status: 'approved' | 'rejected' };
type BookingListQuery = { page?: string; pageSize?: string };

const requireUser = (request: { user?: User }): User => {
  if (!request.user) throw new Error('Authenticated user was not attached.');
  return request.user;
};

export const list = (
  request: Request<unknown, unknown, unknown, BookingListQuery>,
  response: Response,
): void => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    10,
  );
  const result = paginate(
    bookingService.listBookings(requireUser(request)),
    page,
    pageSize,
  );
  sendSuccess(response, {
    message: 'Bookings retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const book = (
  request: Request<unknown, unknown, BookingInput>,
  response: Response,
): void => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Booking created successfully.',
    data: bookingService.createBooking(request.body, requireUser(request), 'approved'),
  });
};

export const requestBooking = (
  request: Request<unknown, unknown, BookingInput>,
  response: Response,
): void => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Booking request submitted successfully.',
    data: bookingService.createBooking(request.body, requireUser(request), 'pending'),
  });
};

export const cancel = (
  request: Request<BookingParams>,
  response: Response,
): void => {
  sendSuccess(response, {
    message: 'Booking cancelled successfully.',
    data: bookingService.cancelBooking(request.params.bookingId, requireUser(request)),
  });
};

export const review = (
  request: Request<BookingParams, unknown, ReviewBody>,
  response: Response,
): void => {
  sendSuccess(response, {
    message: `Booking request ${request.body.status} successfully.`,
    data: bookingService.reviewBooking(
      request.params.bookingId,
      request.body.status,
      requireUser(request),
    ),
  });
};
