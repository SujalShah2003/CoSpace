export type SlotDefinition = {
  startTime: string;
  endTime: string;
  label: string;
};

export const BOOKING_SLOTS: readonly SlotDefinition[] = [
  { startTime: '08:00', endTime: '10:00', label: '08:00 AM – 10:00 AM' },
  { startTime: '10:00', endTime: '12:00', label: '10:00 AM – 12:00 PM' },
  { startTime: '12:00', endTime: '14:00', label: '12:00 PM – 02:00 PM' },
  { startTime: '14:00', endTime: '16:00', label: '02:00 PM – 04:00 PM' },
  { startTime: '16:00', endTime: '18:00', label: '04:00 PM – 06:00 PM' },
  { startTime: '18:00', endTime: '20:00', label: '06:00 PM – 08:00 PM' },
];
