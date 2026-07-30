import { BOOKING_SLOTS } from '../constants/slots.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createPagination } from '../utils/pagination.js';
import { findSpace, getSlots } from './space.service.js';
import type {
  Booking,
  BookingInput,
  BookingStatus,
  User,
} from '../types/domain.js';
import type { Database } from '../types/supabase.js';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type SpaceSummary = { id: string; name: string };
type UserSummary = { id: string; name: string; email: string };

const shortTime = (value: string): string => value.slice(0, 5);

const mapBooking = (
  row: BookingRow,
  space?: SpaceSummary,
  member?: UserSummary,
): Booking => {
  const startTime = shortTime(row.start_time);
  const endTime = shortTime(row.end_time);
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceName: space?.name ?? 'Unknown space',
    memberId: row.member_id,
    requestedBy: member?.name ?? 'Unknown member',
    requestedByEmail: member?.email ?? '',
    date: row.booking_date,
    slot:
      BOOKING_SLOTS.find(
        (item) => item.startTime === startTime && item.endTime === endTime,
      )?.label ?? `${startTime} – ${endTime}`,
    startTime,
    endTime,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
  };
};

const hydrateBookings = async (rows: BookingRow[]): Promise<Booking[]> => {
  if (rows.length === 0) return [];
  const supabase = getSupabaseAdmin();
  const spaceIds = [...new Set(rows.map((row) => row.space_id))];
  const memberIds = [...new Set(rows.map((row) => row.member_id))];
  const [
    { data: spaces, error: spacesError },
    { data: members, error: membersError },
  ] = await Promise.all([
    supabase.from('spaces').select('id, name').in('id', spaceIds),
    supabase.from('users').select('id, name, email').in('id', memberIds),
  ]);
  if (spacesError || membersError) {
    throw new AppError(
      500,
      `Unable to load booking details: ${(spacesError ?? membersError)?.message}`,
    );
  }
  const spacesById = new Map((spaces ?? []).map((item) => [item.id, item]));
  const membersById = new Map((members ?? []).map((item) => [item.id, item]));
  return rows.map((row) =>
    mapBooking(row, spacesById.get(row.space_id), membersById.get(row.member_id)),
  );
};

export const listBookings = async (
  user: User,
  page: number,
  pageSize: number,
) => {
  const from = (page - 1) * pageSize;
  let query = getSupabaseAdmin()
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (user.role !== 'admin') query = query.eq('member_id', user.id);
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new AppError(500, `Unable to list bookings: ${error.message}`);
  return {
    records: await hydrateBookings(data ?? []),
    pagination: createPagination(page, pageSize, count ?? 0),
  };
};

export const createBooking = async (
  values: BookingInput,
  user: User,
  status: Extract<BookingStatus, 'pending' | 'approved'> = 'pending',
): Promise<Booking> => {
  const space = await findSpace(values.spaceId);
  if (space.status !== 'available') {
    throw new AppError(409, 'This space is currently unavailable.');
  }

  const slot = (await getSlots(values.spaceId, values.date)).find(
    (item) => item.startTime === values.startTime && item.endTime === values.endTime,
  );
  if (!slot) throw new AppError(400, 'Select one of the supported booking slots.');
  if (slot.status !== 'available') {
    throw new AppError(409, 'This slot is no longer available.');
  }
  if (new Date(`${values.date}T${slot.startTime}:00`).getTime() <= Date.now()) {
    throw new AppError(400, 'Bookings must start in the future.');
  }

  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .insert({
      space_id: space.id,
      member_id: user.id,
      booking_date: values.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      status,
    })
    .select('*')
    .single();
  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'This slot is no longer available.');
    }
    throw new AppError(500, `Unable to create the booking: ${error.message}`);
  }
  return mapBooking(
    data,
    { id: space.id, name: space.name },
    { id: user.id, name: user.name, email: user.email },
  );
};

export const cancelBooking = async (
  bookingId: string,
  user: User,
): Promise<Booking> => {
  const supabase = getSupabaseAdmin();
  const { data: booking, error: readError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();
  if (readError) {
    throw new AppError(500, `Unable to read the booking: ${readError.message}`);
  }
  if (!booking) throw new AppError(404, 'Booking was not found.');
  if (booking.member_id !== user.id && user.role !== 'admin') {
    throw new AppError(403, 'You can only cancel your own bookings.');
  }
  if (booking.status !== 'pending') {
    throw new AppError(409, 'Only pending booking requests can be cancelled.');
  }
  const startsAt = new Date(
    `${booking.booking_date}T${shortTime(booking.start_time)}:00`,
  );
  if (startsAt.getTime() <= Date.now()) {
    throw new AppError(409, 'Past or started bookings cannot be cancelled.');
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();
  if (error) throw new AppError(500, `Unable to cancel the booking: ${error.message}`);
  if (!data) throw new AppError(409, 'This booking is no longer pending.');
  return (await hydrateBookings([data]))[0]!;
};

export const reviewBooking = async (
  bookingId: string,
  status: Extract<BookingStatus, 'approved' | 'rejected'>,
  admin: User,
): Promise<Booking> => {
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError(400, 'Status must be approved or rejected.');
  }
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle();
  if (error) {
    if (error.code === '23505') {
      throw new AppError(409, 'This slot already has an approved booking.');
    }
    throw new AppError(500, `Unable to review the booking: ${error.message}`);
  }
  if (!data) {
    const { count } = await getSupabaseAdmin()
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('id', bookingId);
    if ((count ?? 0) === 0) {
      throw new AppError(404, 'Booking request was not found.');
    }
    throw new AppError(409, 'Only pending requests can be reviewed.');
  }
  return (await hydrateBookings([data]))[0]!;
};
