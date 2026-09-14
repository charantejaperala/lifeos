import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log('⚡ Connected to MongoDB Cluster successfully!');
    
    // Seed default admin and demo user accounts if not present
    try {
      const { UserModel } = await import('../models/User.model.js');
      const bcrypt = (await import('bcryptjs')).default;

      // 1. Seed Super Admin Account
      const adminEmail = 'admin@lifeos.com';
      const existingAdmin = await UserModel.findOne({ email: adminEmail });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', config.bcryptSaltRounds);
        await UserModel.create({
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'superadmin',
        });
        console.log('⚡ Super Admin account created: admin@lifeos.com / admin123');
      }

      // 2. Seed Demo User Account
      const demoEmail = 'user@lifeos.io';
      const existingDemo = await UserModel.findOne({ email: demoEmail });
      if (!existingDemo) {
        const hashedPassword = await bcrypt.hash('password123', config.bcryptSaltRounds);
        await UserModel.create({
          name: 'Rajesh Kumar',
          email: demoEmail,
          password: hashedPassword,
          role: 'Goal Manager',
        });
        console.log('👤 Demo user created: user@lifeos.io / password123');
      }
    } catch (e: any) {
      console.warn('Notice: Account seed check skipped:', e.message);
    }
  } catch (err: any) {
    console.warn('⚠️ MongoDB Connection Notice:', err.message || 'Offline mode active');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Connection Lost. Attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('⚡ MongoDB Reconnected successfully.');
});
