import { useCallback, useEffect, useState } from 'react';
import {
  BOOKING_REQUESTS_CHANGED,
  createBookingRequest,
  getBookingRequests,
  updateBookingRequestStatus,
  type BookingStatus,
  type NewBookingRequest,
} from '@/utils/bookingRequests';

export const useBookingRequests = () => {
  const [requests, setRequests] = useState(getBookingRequests);

  const refresh = useCallback(() => {
    setRequests(getBookingRequests());
  }, []);

  useEffect(() => {
    window.addEventListener(BOOKING_REQUESTS_CHANGED, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(BOOKING_REQUESTS_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const createRequest = (values: NewBookingRequest) =>
    createBookingRequest(values);

  const updateStatus = (requestId: string, status: BookingStatus) => {
    updateBookingRequestStatus(requestId, status);
  };

  return {
    requests,
    createRequest,
    updateStatus,
  };
};
