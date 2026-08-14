import { Types } from 'mongoose';

export interface IUser {
  _id?: Types.ObjectId;
  email: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  interests: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
