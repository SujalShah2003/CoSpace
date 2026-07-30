import './load-env.js';
import { createAdminClient } from '@supabase/server/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError.js';
import type { Database } from '../types/supabase.js';

let adminClient: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = (): boolean =>
  Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SECRET_KEY &&
      !process.env.SUPABASE_SECRET_KEY.startsWith('replace-'),
  );

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (!isSupabaseConfigured()) {
    throw new AppError(
      503,
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_SECRET_KEY to server/.env.',
    );
  }

  adminClient ??= createAdminClient<Database>();
  return adminClient;
};

export const supabaseStorageBucket = (): string =>
  process.env.SUPABASE_STORAGE_BUCKET || 'space-images';
