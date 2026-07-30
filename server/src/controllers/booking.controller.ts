import * as bookingService from '../services/booking.service.js';
import type { Request, Response } from 'express';
import type { BookingInput, User } from '../types/domain.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';

type BookingParams = { bookingId: string };
type ReviewBody = { status: 'approved' | 'rejected' };
type BookingListQuery = { page?: string; pageSize?: string };

const requireUser = (request: { user?: User }): User => {
  if (!request.user) throw new Error('Authenticated user was not attached.');
  return request.user;
};

export const list = async (
  request: Request<unknown, unknown, unknown, BookingListQuery>,
  response: Response,
): Promise<void> => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    10,
  );
  const result = await bookingService.listBookings(
    requireUser(request),
    page,
    pageSize,
  );
  sendSuccess(response, {
    message: 'Bookings retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const book = async (
  request: Request<unknown, unknown, BookingInput>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Booking created successfully.',
    data: await bookingService.createBooking(request.body, requireUser(request), 'approved'),
  });
};

export const requestBooking = async (
  request: Request<unknown, unknown, BookingInput>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Booking request submitted successfully.',
    data: await bookingService.createBooking(request.body, requireUser(request), 'pending'),
  });
};

export const cancel = async (
  request: Request<BookingParams>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    message: 'Booking cancelled successfully.',
    data: await bookingService.cancelBooking(request.params.bookingId, requireUser(request)),
  });
};

export const review = async (
  request: Request<BookingParams, unknown, ReviewBody>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    message: `Booking request ${request.body.status} successfully.`,
    data: await bookingService.reviewBooking(
      request.params.bookingId,
      request.body.status,
      requireUser(request),
    ),
  });
};
