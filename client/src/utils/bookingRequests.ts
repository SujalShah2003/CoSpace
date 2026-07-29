export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type BookingRequest = {
  id: string;
  spaceId: string;
  spaceName: string;
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  requestedBy: string;
  requestedByEmail: string;
  status: BookingStatus;
  createdAt: string;
};

export type NewBookingRequest = Omit<
  BookingRequest,
  'id' | 'status' | 'createdAt'
>;

const STORAGE_KEY = 'cospace-booking-requests';
export const BOOKING_REQUESTS_CHANGED = 'cospace-booking-requests-changed';

export const getBookingRequests = (): BookingRequest[] => {
  const storedRequests = localStorage.getItem(STORAGE_KEY);

  if (!storedRequests) {
    return [];
  }

  try {
    return JSON.parse(storedRequests) as BookingRequest[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const saveBookingRequests = (requests: BookingRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  window.dispatchEvent(new Event(BOOKING_REQUESTS_CHANGED));
};

const parseTimeToMinutes = (time: string) => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return 0;
  }

  const [, hoursValue, minutesValue, period] = match;
  let hours = Number(hoursValue) % 12;

  if (period.toUpperCase() === 'PM') {
    hours += 12;
  }

  return hours * 60 + Number(minutesValue);
};

const getRequestTimes = (request: {
  slot: string;
  startTime?: string;
  endTime?: string;
}) => {
  const [slotStart = '', slotEnd = ''] = request.slot.split(/\s+(?:–|-)\s+/);

  return {
    start: parseTimeToMinutes(request.startTime || slotStart),
    end: parseTimeToMinutes(request.endTime || slotEnd),
  };
};

export const hasBookingOverlap = (
  candidate: NewBookingRequest,
  requests = getBookingRequests(),
) => {
  const candidateTimes = getRequestTimes(candidate);

  return requests.some((request) => {
    if (
      request.spaceId !== candidate.spaceId ||
      request.date !== candidate.date ||
      !['pending', 'approved'].includes(request.status)
    ) {
      return false;
    }

    const existingTimes = getRequestTimes(request);
    return (
      candidateTimes.start < existingTimes.end &&
      candidateTimes.end > existingTimes.start
    );
  });
};

export const canCancelBooking = (
  request: BookingRequest,
  now = new Date(),
) => {
  if (!['pending', 'approved'].includes(request.status)) {
    return false;
  }

  const { start } = getRequestTimes(request);
  const [year, month, day] = request.date.split('-').map(Number);
  const startDate = new Date(
    year,
    month - 1,
    day,
    Math.floor(start / 60),
    start % 60,
  );

  return startDate.getTime() > now.getTime();
};

export const createBookingRequest = (
  values: NewBookingRequest,
): BookingRequest => {
  const requests = getBookingRequests();

  if (hasBookingOverlap(values, requests)) {
    throw new Error(
      'This time overlaps an existing pending or approved booking.',
    );
  }

  const request: BookingRequest = {
    ...values,
    id: crypto.randomUUID(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  saveBookingRequests([...requests, request]);
  return request;
};

export const updateBookingRequestStatus = (
  requestId: string,
  status: BookingStatus,
) => {
  const requests = getBookingRequests().map((request) =>
    request.id === requestId ? { ...request, status } : request,
  );

  saveBookingRequests(requests);
};
