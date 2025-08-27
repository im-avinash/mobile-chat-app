import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import { auth } from './middleware/auth.js';

const app = express();


const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : '*';
// Middlewares
app.use(cors({
  allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.get('/', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/users', auth, usersRoutes);

export default app;