import { useCallback, useEffect, useState } from 'react';
import type { Space } from '@/components/home/data.temp';
import {
  createSpace as createSpaceRequest,
  deleteSpace as deleteSpaceRequest,
  getAdminSpaces,
  getMemberSpaces,
  getPublicSpaces,
  updateSpace as updateSpaceRequest,
  type SpaceInput,
} from '@/services/spaces.api';
import type { PaginationMeta } from '@/services/apiClient';
import { getCurrentUser } from '@/utils/auth';

export const useSpaces = (publicOnly = false, pageSize = 50) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPage = useCallback(
    async (page: number) => {
      const user = getCurrentUser();
      return publicOnly
        ? getPublicSpaces(page, pageSize)
        : user?.role === 'admin'
          ? getAdminSpaces(page, pageSize)
          : getMemberSpaces(page, pageSize);
    },
    [pageSize, publicOnly],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPage(1);
      setSpaces(result.records);
      setPagination(result.pagination);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load spaces.',
      );
    } finally {
      setLoading(false);
    }
  }, [getPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const loadMore = async () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getPage(pagination.page + 1);
      setSpaces((current) => [
        ...current,
        ...result.records.filter(
          (space) => !current.some((item) => item.id === space.id),
        ),
      ]);
      setPagination(result.pagination);
    } finally {
      setLoadingMore(false);
    }
  };

  const createSpace = async (values: SpaceInput) => {
    const created = await createSpaceRequest(values);
    setSpaces((current) => [...current, created]);
    return created;
  };
  const updateSpace = async (spaceId: string, values: SpaceInput) => {
    const updated = await updateSpaceRequest(spaceId, values);
    setSpaces((current) =>
      current.map((space) => (space.id === spaceId ? updated : space)),
    );
    return updated;
  };
  const deleteSpace = async (spaceId: string) => {
    await deleteSpaceRequest(spaceId);
    setSpaces((current) => current.filter((space) => space.id !== spaceId));
  };

  return {
    spaces,
    pagination,
    hasMore: pagination?.hasNextPage ?? false,
    loading,
    loadingMore,
    error,
    refresh,
    loadMore,
    createSpace,
    updateSpace,
    deleteSpace,
  };
};
