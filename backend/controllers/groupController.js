import pool from '../models/db.js';
import jwt from 'jsonwebtoken';

// Create a new group
export const createGroup = async (req, res) => {
    const { name, description } = req.body;
    const userId = 1; // Hardcoded for now (replace with token-based user ID later if needed)

    try {
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

// Fetch a group by ID
export const getGroupById = async (req, res) => {
    const { id } = req.params;
    console.log(`Fetching group with id: ${id}`); // Debugging log

    try {
        const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            console.log(`No group found with id: ${id}`);
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error fetching group with id ${id}:`, error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete a group
export const deleteGroup = async (req, res) => {
    const { id } = req.params;
    const userId = 1; // Hardcoded for now (replace with token-based user ID later if needed)

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
