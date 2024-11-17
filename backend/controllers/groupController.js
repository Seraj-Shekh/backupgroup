import pool from '../models/db.js';
import jwt from 'jsonwebtoken';

export const createGroup = async (req, res) => {
    const { name, description } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        const result = await pool.query(
            `INSERT INTO groups (name, description, owners_id) VALUES ($1, $2, $3) RETURNING *`,
            [name, description, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGroups = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM groups`);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGroup = async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        const group = await pool.query(`SELECT * FROM groups WHERE id = $1`, [id]);

        if (group.rows.length === 0) return res.status(404).json({ message: 'Group not found' });
        if (group.rows[0].owners_id !== userId) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query(`DELETE FROM groups WHERE id = $1`, [id]);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
