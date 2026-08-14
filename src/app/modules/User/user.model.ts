import { Schema, model } from 'mongoose';
import { IUser } from './user.interface';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Explicitly define indexes as requested by the task
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ interests: 1 });
UserSchema.index({ createdAt: -1 });

export const User = model<IUser>('User', UserSchema);
