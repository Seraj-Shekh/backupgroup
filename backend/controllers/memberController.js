import pool from '../models/db.js';
import jwt from 'jsonwebtoken';

export const joinGroup = async (req, res) => {
    const { groupId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        await pool.query(
            `INSERT INTO groupMembers (users_id, group_id, role, status) VALUES ($1, $2, 'member', 0)`,
            [userId, groupId]
        );
        res.status(200).json({ message: 'Join request sent' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const leaveGroup = async (req, res) => {
    const { groupId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        await pool.query(`DELETE FROM groupMembers WHERE users_id = $1 AND group_id = $2`, [
            userId,
            groupId,
        ]);
        res.status(200).json({ message: 'Left the group successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const manageRequest = async (req, res) => {
    const { groupId, userId, action } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    try {
        if (action === 'accept') {
            await pool.query(
                `UPDATE groupMembers SET status = 1 WHERE users_id = $1 AND group_id = $2`,
                [userId, groupId]
            );
        } else if (action === 'reject') {
            await pool.query(`DELETE FROM groupMembers WHERE users_id = $1 AND group_id = $2`, [
                userId,
                groupId,
            ]);
        }
        res.status(200).json({ message: 'Request managed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
