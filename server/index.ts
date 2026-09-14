import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

// Connect to Database & Start HTTP Server
connectDB().catch((err) => console.error('MongoDB initial connection warning:', err.message));

const server = app.listen(config.port, () => {
  console.log(`🚀 LIFEOS Goals API Server running on port ${config.port}`);
  console.log(`🤖 Ollama AI Service Integration Active at ${config.ollamaHost} (model: ${config.ollamaModel})`);
});

// Graceful Shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 ${signal} signal received. Closing HTTP server and MongoDB connections...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    try {
      await mongoose.connection.close();
      console.log('🔒 MongoDB connection closed cleanly.');
    } catch (err: any) {
      console.error('Error closing MongoDB connection:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

