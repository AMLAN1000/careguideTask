import { Schema, model, Types } from 'mongoose';

export interface INote {
  title: string;
  content: string;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const NoteSchema = new Schema<INote>(
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

// Explicitly define indexes as requested by the task
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ createdAt: -1 });

export const Note = model<INote>('Note', NoteSchema);
