// Provide a minimal declaration for `process` to satisfy TypeScript when
// @types/node is not installed.
declare const process: any;

import bcrypt from 'bcryptjs';
import {
  getSupabaseAdmin,
  supabaseStorageBucket,
} from '../src/config/supabase.js';
import { seedSpaces } from '../src/data/seed-spaces.js';

const email = (process.env.ADMIN_EMAIL || 'admin@cospace.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'Admin@123';
const name = process.env.ADMIN_NAME || 'CoSpace Admin';
const passwordHash = await bcrypt.hash(password, 10);
const supabase = getSupabaseAdmin();

const { error } = await supabase.from('users').upsert(
  {
    name,
    email,
    password_hash: passwordHash,
    role: 'admin',
  },
  { onConflict: 'email' },
);

if (error) {
  throw new Error(`Unable to seed administrator: ${error.message}`);
}

const { data: existingSpaces, error: spacesReadError } = await supabase
  .from('spaces')
  .select('name');

if (spacesReadError) {
  throw new Error(`Unable to read spaces: ${spacesReadError.message}`);
}

const existingNames = new Set(
  (existingSpaces ?? []).map((space) => space.name),
);
const missingSpaces = seedSpaces
  .filter((space) => !existingNames.has(space.name))
  .map((space) => ({
    name: space.name,
    type: space.type,
    description: space.description,
    capacity: space.capacity,
    status: space.status,
    amenities: space.amenities,
    image_url: space.image,
    image_path: null,
  }));

if (missingSpaces.length > 0) {
  const { error: spacesInsertError } = await supabase
    .from('spaces')
    .insert(missingSpaces);

  if (spacesInsertError) {
    throw new Error(`Unable to seed spaces: ${spacesInsertError.message}`);
  }
}

const { data: persistedSpaces, error: persistedSpacesError } = await supabase
  .from('spaces')
  .select('id, name, image_path');

if (persistedSpacesError) {
  throw new Error(
    `Unable to read persisted spaces: ${persistedSpacesError.message}`,
  );
}

const bucket = supabaseStorageBucket();
let uploadedImageCount = 0;

for (const persistedSpace of persistedSpaces ?? []) {
  if (persistedSpace.image_path) continue;

  const sourceSpace = seedSpaces.find(
    (space) => space.name === persistedSpace.name,
  );
  if (!sourceSpace?.image) continue;

  const imageResponse = await fetch(sourceSpace.image);
  if (!imageResponse.ok) {
    throw new Error(
      `Unable to download the image for ${persistedSpace.name}: ${imageResponse.statusText}`,
    );
  }

  const contentType =
    imageResponse.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  const extensionByContentType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  const extension = extensionByContentType[contentType];

  if (!extension) {
    throw new Error(
      `Unsupported image type ${contentType} for ${persistedSpace.name}.`,
    );
  }

  const imageBytes = await imageResponse.arrayBuffer();
  const imagePath = `spaces/${persistedSpace.id}/cover.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(imagePath, imageBytes, {
      contentType,
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(
      `Unable to upload the image for ${persistedSpace.name}: ${uploadError.message}`,
    );
  }

  const { data: publicImage } = supabase.storage
    .from(bucket)
    .getPublicUrl(imagePath);
  const { error: imageUpdateError } = await supabase
    .from('spaces')
    .update({
      image_url: publicImage.publicUrl,
      image_path: imagePath,
    })
    .eq('id', persistedSpace.id);

  if (imageUpdateError) {
    await supabase.storage.from(bucket).remove([imagePath]);
    throw new Error(
      `Unable to update the image details for ${persistedSpace.name}: ${imageUpdateError.message}`,
    );
  }

  uploadedImageCount += 1;
}

console.log(`Administrator seeded for ${email}.`);
console.log(
  `${missingSpaces.length} workspace record${missingSpaces.length === 1 ? '' : 's'} added.`,
);
console.log(
  `${uploadedImageCount} workspace image${uploadedImageCount === 1 ? '' : 's'} uploaded to ${bucket}.`,
);
