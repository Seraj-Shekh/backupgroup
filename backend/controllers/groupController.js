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

        // Filter only the accepted members (status = 1)
        const members = result.rows.filter(row => row.status === 1).map(row => ({
            id: row.member_id,
            name: row.member_name
        }));

        // Get pending join requests (status = 0)
        const joinRequests = result.rows.filter(row => row.status === 0).map(row => ({
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
export const sendJoinRequest = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        // Check if the user is already a member
        const checkMember = await pool.query(
            'SELECT * FROM groupMembers WHERE group_id = $1 AND users_id = $2',
            [groupId, userId]
        );

        if (checkMember.rows.length > 0) {
            return res.status(400).json({ message: 'You are already a member of this group.' });
        }

        // Insert join request with status = 0 (pending)
        const result = await pool.query(
            'INSERT INTO groupMembers (users_id, group_id, status) VALUES ($1, $2, 0) RETURNING *',
            [userId, groupId]
        );

        return res.status(201).json({ message: 'Join request sent successfully!', request: result.rows[0] });
    } catch (error) {
        console.error('Error sending join request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Accept join request
export const acceptJoinRequest = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
        if (group.rows.length === 0) return res.status(404).json({ message: 'Group not found' });

        const ownerId = group.rows[0].owners_id;
        if (ownerId !== userId) {
            return res.status(403).json({ message: 'Only the owner can accept join requests.' });
        }

        // Update the status of the join request to 1 (accepted)
        const result = await pool.query(
            'UPDATE groupMembers SET status = 1 WHERE group_id = $1 AND users_id = $2 AND status = 0 RETURNING *',
            [groupId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Join request not found or already accepted.' });
        }

        return res.status(200).json({ message: 'Join request accepted successfully.' });
    } catch (error) {
        console.error('Error accepting join request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Reject join request
export const rejectJoinRequest = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const group = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
        if (group.rows.length === 0) return res.status(404).json({ message: 'Group not found' });

        const ownerId = group.rows[0].owners_id;
        if (ownerId !== userId) {
            return res.status(403).json({ message: 'Only the owner can reject join requests.' });
        }

        const result = await pool.query(
            'UPDATE groupMembers SET status = -1 WHERE group_id = $1 AND users_id = $2 AND status = 0 RETURNING *',
            [groupId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Join request not found.' });
        }

        return res.status(200).json({ message: 'Join request rejected successfully.' });
    } catch (error) {
        console.error('Error rejecting join request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
