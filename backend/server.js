import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import chemistRoutes from './routes/chemist.routes.js';
import communicationRoutes from './routes/communication.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = 'mongodb+srv://niyatikansal:August3108@cluster0.dpkkfjb.mongodb.net/HackCraft';

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  compression({
    threshold: 0,
  }),
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AID AI server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chemist', chemistRoutes);
app.use('/api/communication', communicationRoutes);
app.post('/api/chat', (req, res) => {
  const message = req.body?.message || '';
  res.json({
    success: true,
    message: `I heard "${message}". For this prototype, I can help guide symptoms, appointments, prescriptions, and when to use the SOS panel.`,
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });
