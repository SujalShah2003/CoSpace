import { useCallback, useEffect, useState } from 'react';
import {
  cancelBooking,
  getBookingRequests,
  getMyBookings,
  requestBooking,
  reviewBooking,
  type BookingInput,
  type BookingRequest,
} from '@/services/bookings.api';
import { getCurrentUser } from '@/utils/auth';
import type { PaginationMeta } from '@/services/apiClient';

type BookingRequestOptions = { page?: number; pageSize?: number };

export const useBookingRequests = ({
  page = 1,
  pageSize = 100,
}: BookingRequestOptions = {}) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const values =
        getCurrentUser()?.role === 'admin'
          ? await getBookingRequests(page, pageSize)
          : await getMyBookings(page, pageSize);
      setRequests(values.records);
      setPagination(values.pagination);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createRequest = async (values: BookingInput) => {
    const created = await requestBooking(values);
    setRequests((current) => [...current, created]);
    return created;
  };

  const updateStatus = async (
    requestId: string,
    status: 'approved' | 'rejected' | 'cancelled',
  ) => {
    const updated =
      status === 'cancelled'
        ? await cancelBooking(requestId)
        : await reviewBooking(requestId, status);
    setRequests((current) =>
      current.map((request) => (request.id === requestId ? updated : request)),
    );
    return updated;
  };

  return {
    requests,
    pagination,
    loading,
    refresh,
    createRequest,
    updateStatus,
  };
};
