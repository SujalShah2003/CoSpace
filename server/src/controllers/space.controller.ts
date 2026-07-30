import { store } from '../data/store.js';
import * as spaceService from '../services/space.service.js';
import type { Request, Response } from 'express';
import type { SpaceInput } from '../types/domain.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { paginate, parsePagination } from '../utils/pagination.js';

type SpaceParams = { spaceId: string };
type SpaceListQuery = {
  date?: string;
  page?: string;
  pageSize?: string;
};

export const listPublic = (
  request: Request<unknown, unknown, unknown, SpaceListQuery>,
  response: Response,
): void => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    12,
  );
  const result = paginate(
    spaceService.listSpaces(request.query.date),
    page,
    pageSize,
  );
  sendSuccess(response, {
    message: 'Spaces retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const listAll = (
  request: Request<unknown, unknown, unknown, SpaceListQuery>,
  response: Response,
): void => {
  const { page, pageSize } = parsePagination(
    request.query.page,
    request.query.pageSize,
    12,
  );
  const result = paginate(store.spaces, page, pageSize);
  sendSuccess(response, {
    message: 'Spaces retrieved successfully.',
    data: result.records,
    pagination: result.pagination,
  });
};

export const slots = (
  request: Request<SpaceParams, unknown, unknown, SpaceListQuery>,
  response: Response,
): void => {
  sendSuccess(response, {
    message: 'Booking slots retrieved successfully.',
    data: spaceService.getSlots(request.params.spaceId, request.query.date ?? ''),
  });
};

export const create = (
  request: Request<unknown, unknown, SpaceInput>,
  response: Response,
): void => {
  sendSuccess(response, {
    statusCode: 201,
    message: 'Space created successfully.',
    data: spaceService.createSpace(request.body),
  });
};

export const update = (
  request: Request<SpaceParams, unknown, Partial<SpaceInput>>,
  response: Response,
): void => {
  sendSuccess(response, {
    message: 'Space updated successfully.',
    data: spaceService.updateSpace(request.params.spaceId, request.body),
  });
};

export const remove = (
  request: Request<SpaceParams>,
  response: Response,
): void => {
  spaceService.removeSpace(request.params.spaceId);
  sendSuccess(response, {
    message: 'Space deleted successfully.',
    data: null,
  });
};
