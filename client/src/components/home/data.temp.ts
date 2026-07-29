export type Space = {
  id: string;
  name: string;
  type: string;
  description: string;
  capacity: number;
  image: string;
  amenities: string[];
  status?: 'available' | 'unavailable';
};

export const spaceTypes = ['All spaces', 'Hot Desk', 'Meeting Room', 'Private Office'];

export const spaces: Space[] = [
  {
    id: 'window-focus-desk',
    name: 'Window Focus Desk',
    type: 'Hot Desk',
    description: 'A bright window-side desk designed for quiet, focused individual work.',
    capacity: 1,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85',
    amenities: ['Fast Wi-Fi', 'Ergonomic chair'],
  },
  {
    id: 'olive-room',
    name: 'The Olive Room',
    type: 'Meeting Room',
    description: 'A private meeting room for collaborative sessions, presentations and calls.',
    capacity: 6,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85',
    amenities: ['4K display', 'Whiteboard'],
  },
  {
    id: 'studio-north',
    name: 'Studio North',
    type: 'Private Office',
    description: 'A calm private office with everything a small team needs for a productive day.',
    capacity: 4,
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=900&q=85',
    amenities: ['Fast Wi-Fi', 'Coffee included'],
  },
  {
    id: 'community-table',
    name: 'Community Table',
    type: 'Hot Desk',
    description: 'A spacious shared table that is perfect for flexible work and casual collaboration.',
    capacity: 8,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=85',
    amenities: ['Natural light', 'Power outlets'],
  },
  {
    id: 'boardroom',
    name: 'The Boardroom',
    type: 'Meeting Room',
    description: 'A professional boardroom equipped for workshops, presentations and team meetings.',
    capacity: 12,
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4b2?auto=format&fit=crop&w=900&q=85',
    amenities: ['Video conferencing', 'Whiteboard'],
  },
  {
    id: 'quiet-corner',
    name: 'Quiet Corner',
    type: 'Private Office',
    description: 'A sound-controlled private room for focused work, interviews and confidential calls.',
    capacity: 2,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=85',
    amenities: ['Soundproof', 'Standing desk'],
  },
];

export const benefits = [
  { icon: 'wifi', title: 'Fast, reliable Wi-Fi', text: 'Enterprise-grade internet in every corner.' },
  { icon: 'clock', title: 'Book by the hour', text: 'Use what you need, whenever you need it.' },
  { icon: 'coffee', title: 'Coffee on us', text: 'Fresh coffee, tea and filtered water all day.' },
  { icon: 'shield', title: 'Safe and secure', text: 'Secure access and a team on site to help.' },
];

export const homeText = {
  hero: {
    badge: 'Flexible workspace, your way',
    title: 'A better space to do your',
    highlightedTitle: 'best work.',
    description:
      'Beautiful desks, private offices and meeting rooms—ready when you are. Find your space and book in seconds.',
  },
  spaces: {
    badge: 'Find your fit',
    title: 'Spaces made for every kind of work',
    description: 'From a quiet desk for deep focus to a meeting room for your whole team.',
  },
  amenities: {
    badge: 'Everything included',
    title: 'Just bring your best ideas',
    description: 'We take care of the details, so you can focus on doing work that matters.',
  },
  cta: {
    badge: 'Your desk is waiting',
    title: 'Ready to make space for great work?',
  },
};
