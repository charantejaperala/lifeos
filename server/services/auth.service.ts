import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/User.model';
import { config } from '../config/env';

function createApiError(message: string, statusCode: number) {
  const err = new Error(message) as any;
  err.statusCode = statusCode;
  return err;
}

export class AuthService {
  static async signup(name: string, email: string, password?: string) {
    if (!name || !email || !password) {
      throw createApiError('Name, email, and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      throw createApiError('An account with this email address already exists. Please log in instead.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
    const user = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'Goal Manager',
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  static async login(email: string, password?: string) {
    if (!email || !password) {
      throw createApiError('Email and password are required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      throw createApiError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createApiError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  static async forgotPassword(email: string) {
    if (!email) {
      throw createApiError('Email is required', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return {
        message: 'If an account exists with that email, reset instructions have been generated.',
        resetToken: 'demo-reset-token-' + Date.now(),
      };
    }

    const resetToken = `reset-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour expiry
    await user.save();

    return {
      message: 'Password reset token generated successfully.',
      resetToken,
    };
  }

  static async resetPassword(resetToken: string, newPassword?: string) {
    if (!resetToken || !newPassword) {
      throw createApiError('Reset token and new password are required', 400);
    }

    const user = await UserModel.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw createApiError('Invalid or expired reset token', 400);
    }

    user.password = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully! You can now log in with your new password.' };
  }

  static async getUserProfile(userId: string) {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return user;
  }
}
