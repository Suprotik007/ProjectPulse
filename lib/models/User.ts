// lib/models/User.ts
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({ 
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['Admin', 'Employee', 'Client'],
      required: [true, 'Role is required'],
    },
  },
  {
    timestamps: true,
  }
);

 const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


export default User
   