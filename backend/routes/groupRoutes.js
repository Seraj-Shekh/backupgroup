// groupRoutes.js
import express from 'express';
import { createGroup, getGroups, deleteGroup, getGroupById } from '../controllers/groupController.js';

const router = express.Router();

// Route for creating a group (POST)
router.post('/create', createGroup);

// Route for listing all groups (GET)
router.get('/', getGroups);

// Route for getting a specific group by ID (GET)
router.get('/:id', getGroupById);

// Route for deleting a group (DELETE)
router.delete('/:id', deleteGroup);

export { router as groupRoutes };
