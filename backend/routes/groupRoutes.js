import express from 'express';
import { createGroup, getGroups, deleteGroup, getGroupById, sendJoinRequest, acceptJoinRequest, rejectJoinRequest, removeMember, leaveGroup } from '../controllers/groupController.js';

const router = express.Router();

// Route for creating a group (POST)
router.post('/create', createGroup);

// Route for listing all groups (GET)
router.get('/', getGroups);

// Route for getting a specific group by ID (GET)
router.get('/:id', getGroupById);

// Route for deleting a group (DELETE)
router.delete('/:id', deleteGroup);

// Route to send a join request
router.post('/join-request', sendJoinRequest);

// Route to accept a join request
router.post('/accept-request', acceptJoinRequest);

// Route to reject a join request
router.post('/reject-request', rejectJoinRequest);

// Route to remove a member (only for the owner)
router.post('/remove-member', removeMember);

// Route to leave the group (only for members)
router.post('/leave-group', leaveGroup);


export { router as groupRoutes };
