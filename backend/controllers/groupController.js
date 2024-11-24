import pool from '../models/db.js';
import jwt from 'jsonwebtoken';

// Create a new group
export const createGroup = async (req, res) => {
    const { name, description, userId } = req.body;

    try {
        // Make sure the userId exists in the database
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Insert the new group with the provided userId as the owner
        const result = await pool.query(
            `INSERT INTO groups (name, description, owners_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, description, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// List all groups
export const getGroups = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM groups`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching groups:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Fetch a group by ID and return join requests
// Fetch a group by ID and return join requests
export const getGroupById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT groups.*, 
                   users.id AS member_id, 
                   users.name AS member_name,
                   groupMembers.status,
                   groupMembers.id AS request_id
            FROM groups
            LEFT JOIN groupMembers ON groups.id = groupMembers.group_id
            LEFT JOIN users ON users.id = groupMembers.users_id
            WHERE groups.id = $1`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Prepare the group data
        const group = result.rows[0];

        // Filter only the accepted members (status = 'accepted')
        const members = result.rows.filter(row => row.status === 'accepted').map(row => ({
            id: row.member_id,
            name: row.member_name
        }));

        // Get pending join requests (status = 'pending')
        const joinRequests = result.rows.filter(row => row.status === 'pending').map(row => ({
            users_id: row.member_id,
            user_name: row.member_name,
            request_id: row.request_id
        }));

        res.status(200).json({ ...group, members, joinRequests });
    } catch (error) {
        console.error(`Error fetching group with id ${id}:`, error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Send a join request
// Send a join request
export const sendJoinRequest = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        // Check if the user is already a member or has a pending request
        const existingMember = await pool.query(
            `SELECT * FROM groupMembers WHERE group_id = $1 AND users_id = $2`,
            [groupId, userId]
        );

        if (existingMember.rowCount > 0) {
            return res.status(400).json({ message: 'You have already joined or requested to join this group.' });
        }

        // Insert a new join request with status 'pending'
        await pool.query(
            `INSERT INTO groupMembers (group_id, users_id, status) VALUES ($1, $2, $3)`,
            [groupId, userId, 'pending'] // Ensure status is 'pending'
        );

        res.status(200).json({ message: 'Join request sent successfully.' });
    } catch (error) {
        console.error('Error sending join request:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Accept join request
// Accept a join request
// Accept a join request
export const acceptJoinRequest = async (req, res) => {
    const { groupId, userId, currentUserId } = req.body;

    try {
        // Fetch the group and join request details
        const joinRequest = await pool.query(
            `SELECT gm.*, g.owners_id 
            FROM groupMembers gm
            JOIN groups g ON gm.group_id = g.id
            WHERE gm.group_id = $1 AND gm.users_id = $2 AND gm.status = $3`,
            [groupId, userId, 'pending'] // Check for 'pending' status
        );

        if (joinRequest.rowCount === 0) {
            return res.status(404).json({ message: 'Join request not found or already processed.' });
        }

        const { owners_id } = joinRequest.rows[0];

        // Validate if the current user is the owner of the group
        if (owners_id !== currentUserId) {
            return res.status(403).json({ message: 'Only the group owner can accept requests.' });
        }

        // Update the member status to 'accepted'
        await pool.query(
            `UPDATE groupMembers SET status = $1 
            WHERE group_id = $2 AND users_id = $3`,
            ['accepted', groupId, userId]
        );

        res.status(200).json({ message: 'Join request accepted successfully.' });
    } catch (error) {
        console.error('Error accepting join request:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Reject join request
// Reject a join request
// Reject a join request
export const rejectJoinRequest = async (req, res) => {
    const { groupId, userId, currentUserId } = req.body;

    try {
        // Fetch the group and join request details
        const joinRequest = await pool.query(
            `SELECT gm.*, g.owners_id 
            FROM groupMembers gm
            JOIN groups g ON gm.group_id = g.id
            WHERE gm.group_id = $1 AND gm.users_id = $2 AND gm.status = $3`,
            [groupId, userId, 'pending'] // Check for 'pending' status
        );

        if (joinRequest.rowCount === 0) {
            return res.status(404).json({ message: 'Join request not found or already processed.' });
        }

        const { owners_id } = joinRequest.rows[0];

        // Validate if the current user is the owner of the group
        if (owners_id !== currentUserId) {
            return res.status(403).json({ message: 'Only the group owner can reject requests.' });
        }

        // Update the member status to 'rejected'
        await pool.query(
            `UPDATE groupMembers SET status = $1 
            WHERE group_id = $2 AND users_id = $3`,
            ['rejected', groupId, userId]
        );

        res.status(200).json({ message: 'Join request rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting join request:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};




// Delete a group
export const deleteGroup = async (req, res) => {
    const { id } = req.params;  // Group ID to delete
    const { userId } = req.body;  // User who is attempting to delete the group

    try {
        // Fetch the group by ID to check if the requester is the owner
        const groupResult = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
        if (groupResult.rows.length === 0) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const group = groupResult.rows[0];
        if (group.owners_id !== userId) {
            return res.status(403).json({ message: 'Only the owner can delete this group.' });
        }

        // Delete all group members associated with the group first
        await pool.query('DELETE FROM groupMembers WHERE group_id = $1', [id]);

        // Delete the group
        await pool.query('DELETE FROM groups WHERE id = $1', [id]);

        return res.status(200).json({ message: 'Group deleted successfully.' });
    } catch (error) {
        console.error('Error deleting group:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
