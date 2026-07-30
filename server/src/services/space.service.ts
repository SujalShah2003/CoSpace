import { randomUUID } from 'node:crypto';
import { BOOKING_SLOTS } from '../constants/slots.js';
import {
  getSupabaseAdmin,
  supabaseStorageBucket,
} from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';
import { createPagination } from '../utils/pagination.js';
import type {
  BookingSlot,
  Space,
  SpaceInput,
} from '../types/domain.js';
import type { Database } from '../types/supabase.js';

export type SpaceFilters = {
  search?: string;
  minCapacity?: number;
  type?: string;
};

type SpaceRow = Database['public']['Tables']['spaces']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];

const mapSpace = (row: SpaceRow): Space => ({
  id: row.id,
  name: row.name,
  type: row.type,
  description: row.description,
  capacity: row.capacity,
  image: row.image_url ?? '',
  amenities: row.amenities,
  status: row.status,
});

const normalizeTime = (value: string): string => value.slice(0, 5);

const validateDate = (date: string): void => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    throw new AppError(400, 'A date in YYYY-MM-DD format is required.');
  }
};

const slotsFromBookings = (bookings: BookingRow[]): BookingSlot[] =>
  BOOKING_SLOTS.map((slot) => {
    const booking = bookings.find(
      (item) =>
        normalizeTime(item.start_time) === slot.startTime &&
        normalizeTime(item.end_time) === slot.endTime,
    );
    return {
      ...slot,
      status:
        booking?.status === 'pending'
          ? 'pending'
          : booking
            ? 'booked'
            : 'available',
      bookingId: booking?.id,
    };
  });

export const findSpace = async (spaceId: string): Promise<Space> => {
  const { data, error } = await getSupabaseAdmin()
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .maybeSingle();
  if (error) throw new AppError(500, `Unable to read the space: ${error.message}`);
  if (!data) throw new AppError(404, 'Space was not found.');
  return mapSpace(data);
};

export const getSlots = async (
  spaceId: string,
  date: string,
): Promise<BookingSlot[]> => {
  await findSpace(spaceId);
  validateDate(date);
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('space_id', spaceId)
    .eq('booking_date', date)
    .in('status', ['pending', 'approved']);
  if (error) {
    throw new AppError(500, `Unable to read booking slots: ${error.message}`);
  }
  return slotsFromBookings(data ?? []);
};

export const listSpaces = async ({
  date,
  filters = {},
  page,
  pageSize,
  includeUnavailable = false,
}: {
  date?: string;
  filters?: SpaceFilters;
  page: number;
  pageSize: number;
  includeUnavailable?: boolean;
}) => {
  if (date) validateDate(date);
  const from = (page - 1) * pageSize;
  let query = getSupabaseAdmin()
    .from('spaces')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: true });

  if (!includeUnavailable) query = query.eq('status', 'available');
  if (filters.minCapacity) query = query.gte('capacity', filters.minCapacity);
  if (filters.type?.trim()) {
    query = query.ilike('type', filters.type.trim());
  }
  if (filters.search?.trim()) {
    const search = filters.search.trim().replace(/[%(),]/g, ' ');
    query = query.or(
      `name.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new AppError(500, `Unable to list spaces: ${error.message}`);

  const rows = data ?? [];
  const bookingMap = new Map<string, BookingRow[]>();
  if (date && rows.length > 0) {
    const { data: bookings, error: bookingsError } = await getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .in('space_id', rows.map((space) => space.id))
      .eq('booking_date', date)
      .in('status', ['pending', 'approved']);
    if (bookingsError) {
      throw new AppError(500, `Unable to read booked times: ${bookingsError.message}`);
    }
    for (const booking of bookings ?? []) {
      bookingMap.set(booking.space_id, [
        ...(bookingMap.get(booking.space_id) ?? []),
        booking,
      ]);
    }
  }

  return {
    records: rows.map((row) => ({
      ...mapSpace(row),
      ...(date
        ? {
            bookedTimes: slotsFromBookings(bookingMap.get(row.id) ?? []).filter(
              (slot) => slot.status !== 'available',
            ),
          }
        : {}),
    })),
    pagination: createPagination(page, pageSize, count ?? 0),
  };
};

const validateSpace = (values: SpaceInput): void => {
  if (!values.name?.trim() || !values.type?.trim() || !values.description?.trim()) {
    throw new AppError(400, 'Name, type and description are required.');
  }
  if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < 1) {
    throw new AppError(400, 'Capacity must be a positive integer.');
  }
};

const storeImage = async (
  spaceId: string,
  image: string,
): Promise<{ imageUrl: string | null; imagePath: string | null }> => {
  if (!image) return { imageUrl: null, imagePath: null };
  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  if (!match) return { imageUrl: image, imagePath: null };
  const contentType = match[1]!;
  const base64 = match[2]!;

  const extension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }[contentType];
  if (!extension) throw new AppError(400, 'Use a JPG, PNG or WebP image.');
  const bytes = Buffer.from(base64, 'base64');
  if (bytes.length > 5 * 1024 * 1024) {
    throw new AppError(400, 'The image must be 5 MB or smaller.');
  }

  const path = `spaces/${spaceId}/cover.${extension}`;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(supabaseStorageBucket())
    .upload(path, bytes, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });
  if (error) throw new AppError(500, `Unable to store the image: ${error.message}`);
  const { data } = supabase.storage
    .from(supabaseStorageBucket())
    .getPublicUrl(path);
  return { imageUrl: data.publicUrl, imagePath: path };
};

export const createSpace = async (values: SpaceInput): Promise<Space> => {
  validateSpace(values);
  const id = randomUUID();
  const storedImage = await storeImage(id, values.image || '');
  const { data, error } = await getSupabaseAdmin()
    .from('spaces')
    .insert({
      id,
      name: values.name.trim(),
      type: values.type.trim(),
      description: values.description.trim(),
      capacity: Number(values.capacity),
      image_url: storedImage.imageUrl,
      image_path: storedImage.imagePath,
      amenities: Array.isArray(values.amenities) ? values.amenities : [],
      status: values.status === 'unavailable' ? 'unavailable' : 'available',
    })
    .select('*')
    .single();
  if (error) {
    if (storedImage.imagePath) {
      await getSupabaseAdmin().storage
        .from(supabaseStorageBucket())
        .remove([storedImage.imagePath]);
    }
    throw new AppError(500, `Unable to create the space: ${error.message}`);
  }
  return mapSpace(data);
};

export const updateSpace = async (
  spaceId: string,
  values: Partial<SpaceInput>,
): Promise<Space> => {
  const supabase = getSupabaseAdmin();
  const { data: current, error: readError } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .maybeSingle();
  if (readError) {
    throw new AppError(500, `Unable to read the space: ${readError.message}`);
  }
  if (!current) throw new AppError(404, 'Space was not found.');

  const merged: SpaceInput = {
    ...mapSpace(current),
    ...values,
  };
  validateSpace(merged);
  const changedImage =
    values.image !== undefined && values.image !== (current.image_url ?? '');
  const storedImage = changedImage
    ? await storeImage(spaceId, values.image ?? '')
    : { imageUrl: current.image_url, imagePath: current.image_path };

  const { data, error } = await supabase
    .from('spaces')
    .update({
      name: merged.name.trim(),
      type: merged.type.trim(),
      description: merged.description.trim(),
      capacity: Number(merged.capacity),
      image_url: storedImage.imageUrl,
      image_path: storedImage.imagePath,
      amenities: Array.isArray(merged.amenities) ? merged.amenities : [],
      status: merged.status === 'unavailable' ? 'unavailable' : 'available',
    })
    .eq('id', spaceId)
    .select('*')
    .single();
  if (error) throw new AppError(500, `Unable to update the space: ${error.message}`);

  if (
    changedImage &&
    current.image_path &&
    current.image_path !== storedImage.imagePath
  ) {
    await supabase.storage
      .from(supabaseStorageBucket())
      .remove([current.image_path]);
  }
  return mapSpace(data);
};

export const removeSpace = async (spaceId: string): Promise<void> => {
  const supabase = getSupabaseAdmin();
  const { data: current, error: readError } = await supabase
    .from('spaces')
    .select('id, image_path')
    .eq('id', spaceId)
    .maybeSingle();
  if (readError) {
    throw new AppError(500, `Unable to read the space: ${readError.message}`);
  }
  if (!current) throw new AppError(404, 'Space was not found.');

  const { count, error: bookingError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('space_id', spaceId)
    .in('status', ['pending', 'approved']);
  if (bookingError) {
    throw new AppError(500, `Unable to check bookings: ${bookingError.message}`);
  }
  if ((count ?? 0) > 0) {
    throw new AppError(409, 'A space with active bookings cannot be deleted.');
  }

  const { error } = await supabase.from('spaces').delete().eq('id', spaceId);
  if (error) throw new AppError(500, `Unable to delete the space: ${error.message}`);
  if (current.image_path) {
    await supabase.storage
      .from(supabaseStorageBucket())
      .remove([current.image_path]);
  }
};
