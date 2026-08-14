import { Schema, model, Types } from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Explicitly define indexing for Scenario 2 aggregation lookup
PostSchema.index({ userId: 1 });

export const Post = model<IPost>('Post', PostSchema);
