import { spaces as defaultSpaces, type Space } from '@/components/home/data.temp';

const STORAGE_KEY = 'cospace-spaces';
export const SPACES_CHANGED = 'cospace-spaces-changed';

export const getSpaces = (): Space[] => {
  const storedSpaces = localStorage.getItem(STORAGE_KEY);

  if (!storedSpaces) {
    return defaultSpaces;
  }

  try {
    return JSON.parse(storedSpaces) as Space[];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return defaultSpaces;
  }
};

const saveSpaces = (spaces: Space[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  window.dispatchEvent(new Event(SPACES_CHANGED));
};

export const createSpace = (space: Omit<Space, 'id'>) => {
  const newSpace: Space = { ...space, id: crypto.randomUUID() };
  saveSpaces([...getSpaces(), newSpace]);
  return newSpace;
};

export const updateSpace = (spaceId: string, values: Omit<Space, 'id'>) => {
  saveSpaces(
    getSpaces().map((space) =>
      space.id === spaceId ? { ...values, id: spaceId } : space,
    ),
  );
};

export const deleteSpace = (spaceId: string) => {
  saveSpaces(getSpaces().filter((space) => space.id !== spaceId));
};
