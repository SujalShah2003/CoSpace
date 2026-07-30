export type UserRole = 'member' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

export type PublicUser = Omit<User, 'passwordHash'>;
export type SpaceStatus = 'available' | 'unavailable';

export type Space = {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  image: string;
  amenities: string[];
  status: SpaceStatus;
};

export type SpaceInput = Omit<Space, 'id'>;
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type Booking = {
  id: string;
  spaceId: string;
  spaceName: string;
  memberId: string;
  requestedBy: string;
  requestedByEmail: string;
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

export type BookingInput = Pick<
  Booking,
  'spaceId' | 'date' | 'startTime' | 'endTime'
>;

export type SlotStatus = 'available' | 'pending' | 'booked';

export type BookingSlot = {
  startTime: string;
  endTime: string;
  label: string;
  status: SlotStatus;
  bookingId?: string;
};

export type RefreshSession = {
  id: string;
  userId: string;
  expiresAt: number;
};

export type Store = {
  users: User[];
  spaces: Space[];
  bookings: Booking[];
  refreshSessions: RefreshSession[];
};

export type AuthCredentials = { email: string; password: string };
export type RegistrationInput = AuthCredentials & { name: string };
export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
};
export type AuthSession = { user: PublicUser; tokens: TokenPair };
