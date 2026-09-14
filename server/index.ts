import app from './app';
import { connectDB } from './config/db';
import { config } from './config/env';

// Connect to Database & Start HTTP Server
connectDB().catch((err) => console.error('MongoDB initial connection warning:', err.message));

app.listen(config.port, () => {
  console.log(`🚀 LIFEOS Goals API Server running on port ${config.port}`);
  console.log(`🤖 Ollama AI Service Integration Active at ${config.ollamaHost} (model: ${config.ollamaModel})`);
});
