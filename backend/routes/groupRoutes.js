import express from 'express';
import { createGroup, getGroups, deleteGroup } from '../controllers/groupController.js';

const router = express.Router();

router.post('/create', createGroup);
router.get('/', getGroups);
router.delete('/:id', deleteGroup);

export { router as groupRoutes };
