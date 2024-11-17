import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { groupRoutes } from './routes/groupRoutes.js';
import { memberRoutes } from './routes/memberRoutes.js';

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.get('/', (req, res) => {
    res.send('Server is running successfully!');
});

app.use('/api/groups', groupRoutes);
app.use('/api/members', memberRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
