import type { Space } from '@/components/home/data.temp';
import {
  apiClient,
  type ApiResponse,
  type PaginatedResult,
} from './apiClient';

export type SlotStatus = 'available' | 'pending' | 'booked';
export type BookingSlot = {
  startTime: string;
  endTime: string;
  label: string;
  status: SlotStatus;
  bookingId?: string;
};

export type SpaceWithBookedTimes = Space & { bookedTimes?: BookingSlot[] };
export type SpaceInput = Omit<Space, 'id'>;

const getPagination = <T>(
  records: T[],
  response: ApiResponse<T[]>,
): PaginatedResult<T> => ({
  records,
  pagination: response.pagination ?? {
    page: 1,
    pageSize: records.length,
    total: records.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
});

export const getPublicSpaces = async (
  page = 1,
  pageSize = 50,
  date?: string,
) => {
  const { data } = await apiClient.get<ApiResponse<SpaceWithBookedTimes[]>>(
    '/public/spaces',
    { params: { date, page, pageSize } },
  );
  return getPagination(data.data, data);
};

export const getMemberSpaces = async (page = 1, pageSize = 50) => {
  const { data } = await apiClient.get<ApiResponse<Space[]>>(
    '/member/spaces',
    { params: { page, pageSize } },
  );
  return getPagination(data.data, data);
};

export const getAdminSpaces = async (page = 1, pageSize = 50) => {
  const { data } = await apiClient.get<ApiResponse<Space[]>>(
    '/admin/spaces',
    { params: { page, pageSize } },
  );
  return getPagination(data.data, data);
};

export const getAvailableSlots = async (
  spaceId: string,
  date: string,
  isPublic = false,
) => {
  const prefix = isPublic ? '/public' : '/member';
  const { data } = await apiClient.get<ApiResponse<BookingSlot[]>>(
    `${prefix}/spaces/${spaceId}/slots`,
    { params: { date } },
  );
  return data.data;
};

export const createSpace = async (values: SpaceInput) => {
  const { data } = await apiClient.post<ApiResponse<Space>>('/admin/spaces', values);
  return data.data;
};

export const updateSpace = async (spaceId: string, values: SpaceInput) => {
  const { data } = await apiClient.put<ApiResponse<Space>>(
    `/admin/spaces/${spaceId}`,
    values,
  );
  return data.data;
};

export const deleteSpace = async (spaceId: string) => {
  await apiClient.delete(`/admin/spaces/${spaceId}`);
};
