import express, { Application } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Global Central Error Handling Middleware
app.use(errorHandler as any);

export default app;
