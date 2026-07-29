import { useCallback, useEffect, useState } from 'react';
import {
  createSpace,
  deleteSpace,
  getSpaces,
  SPACES_CHANGED,
  updateSpace,
} from '@/utils/spaces';

export const useSpaces = () => {
  const [spaces, setSpaces] = useState(getSpaces);
  const refresh = useCallback(() => setSpaces(getSpaces()), []);

  useEffect(() => {
    window.addEventListener(SPACES_CHANGED, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(SPACES_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return {
    spaces,
    createSpace,
    updateSpace,
    deleteSpace,
  };
};
