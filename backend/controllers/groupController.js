import pool from '../models/db.js';
import jwt from 'jsonwebtoken';

// Create a new group
// groupController.js - Create Group function
export const createGroup = async (req, res) => {
    const { name, description, userId } = req.body;  // userId passed from frontend request

    // Log the userId and group data to verify if correct values are received
    console.log('Received userId in backend:', userId);
    console.log('Group data:', { name, description });

    try {
        // Make sure the userId exists in the database, this is to prevent creating groups without a valid user
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'User not found' }); // Error if the user doesn't exist
        }

        // Insert the new group with the provided userId as the owner
        const result = await pool.query(
            `INSERT INTO groups (name, description, owners_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, description, userId]  // Use the userId passed from the frontend
        );

        // Log the created group for verification
        console.log('Group created successfully:', result.rows[0]);

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

// Fetch a group by ID
// Fetch a group by ID
export const getGroupById = async (req, res) => {
    const { id } = req.params;
    console.log(`Fetching group with id: ${id}`); // Debugging log

    try {
        // Fetch group data and join with groupMembers to get members' details
        const result = await pool.query(`
            SELECT groups.*, 
                   users.id AS member_id, 
                   users.name AS member_name
            FROM groups
            LEFT JOIN groupMembers ON groups.id = groupMembers.group_id
            LEFT JOIN users ON users.id = groupMembers.users_id
            WHERE groups.id = $1`, [id]);

        if (result.rows.length === 0) {
            console.log(`No group found with id: ${id}`);
            return res.status(404).json({ message: 'Group not found' });
        }

        // Prepare the group data
        const group = result.rows[0];
        const members = result.rows.map(row => ({
            id: row.member_id,
            name: row.member_name
        }));

        res.status(200).json({ ...group, members });
    } catch (error) {
        console.error(`Error fetching group with id ${id}:`, error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Delete a group
export const deleteGroup = async (req, res) => {
    const { id } = req.params;
    const userId = 1; // Hardcoded for now, replace with the logged-in user's ID later

    try {
        const group = await pool.query(`SELECT * FROM groups WHERE id = $1`, [id]);
        if (group.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
        if (group.rows[0].owners_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query(`DELETE FROM groups WHERE id = $1`, [id]);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error(`Error deleting group with id ${id}:`, error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

