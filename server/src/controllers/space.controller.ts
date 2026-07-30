import * as spaceService from '../services/space.service.js';
import type { Request, Response } from 'express';
import type { SpaceInput } from '../types/domain.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination } from '../utils/pagination.js';

type SpaceParams = { spaceId: string };
type SpaceListQuery = {
  date?: string;
  page?: string;
  pageSize?: string;
  search?: string;
  minCapacity?: string;
  type?: string;
};

const getFilters = (query: SpaceListQuery) => {
  const parsedCapacity = Number(query.minCapacity);
  return {
    search: query.search,
    type: query.type,
    minCapacity:
      Number.isFinite(parsedCapacity) && parsedCapacity > 0
        ? parsedCapacity
        : undefined,
  };
};

export const listPublic = async (
  request: Request<unknown, unknown, unknown, SpaceListQuery>,
  response: Response,
): Promise<void> => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    12,
  );
  const result = await spaceService.listSpaces({
    date: request.query.date,
    filters: getFilters(request.query),
    page,
    pageSize,
  });
  sendSuccess(response, {
    message: 'Spaces retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const listAll = async (
  request: Request<unknown, unknown, unknown, SpaceListQuery>,
  response: Response,
): Promise<void> => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    12,
  );
  const result = await spaceService.listSpaces({
    filters: getFilters(request.query),
    page,
    pageSize,
    includeUnavailable: true,
  });
  sendSuccess(response, {
    message: 'Spaces retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const slots = async (
  request: Request<SpaceParams, unknown, unknown, SpaceListQuery>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    message: 'Booking slots retrieved successfully.',
    data: await spaceService.getSlots(request.params.spaceId, request.query.date ?? ''),
  });
};

export const create = async (
  request: Request<unknown, unknown, SpaceInput>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Space created successfully.',
    data: await spaceService.createSpace(request.body),
  });
};

export const update = async (
  request: Request<SpaceParams, unknown, Partial<SpaceInput>>,
  response: Response,
): Promise<void> => {
  sendSuccess(response, {
    message: 'Space updated successfully.',
    data: await spaceService.updateSpace(request.params.spaceId, request.body),
  });
};

export const remove = async (
  request: Request<SpaceParams>,
  response: Response,
): Promise<void> => {
  await spaceService.removeSpace(request.params.spaceId);
  sendSuccess(response, {
    message: 'Space deleted successfully.',
    data: null,
  });
};
