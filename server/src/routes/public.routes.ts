import { Router } from 'express';
import * as spaceController from '../controllers/space.controller.js';

const router = Router();
router.get('/spaces', spaceController.listPublic);
router.get('/spaces/:spaceId/slots', spaceController.slots);

export default router;
