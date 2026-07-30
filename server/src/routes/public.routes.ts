import { Router } from 'express';
import * as spaceController from '../controllers/space.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/spaces', asyncHandler(spaceController.listPublic));
router.get('/spaces/:spaceId/slots', asyncHandler(spaceController.slots));

export default router;
