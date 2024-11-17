import express from 'express';
import { joinGroup, leaveGroup, manageRequest } from '../controllers/memberController.js';

const router = express.Router();

router.post('/join', joinGroup);
router.post('/leave', leaveGroup);
router.post('/manage', manageRequest);

export { router as memberRoutes };
