import mongoose, { Schema, Model } from 'mongoose';
import { ICheckIn } from '../types';

const CheckInSchema = new Schema<ICheckIn>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    progressSummary: {
      type: String,
      required: [true, 'Progress summary is required'],
      trim: true,
    },
    blockers: {
      type: String,
      default: '',
      trim: true,
    },
    confidenceLevel: {
      type: Number,
      required: [true, 'Confidence level is required'],
      min: 1,
      max: 5,
    },
    completionPercentage: {
      type: Number,
      required: [true, 'Completion percentage is required'],
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

CheckInSchema.index({ projectId: 1, employeeId: 1, weekStartDate: 1 }, { unique: true });
CheckInSchema.index({ projectId: 1, createdAt: -1 });
CheckInSchema.index({ employeeId: 1, createdAt: -1 });

const CheckIn: Model<ICheckIn> =
  mongoose.models.CheckIn || mongoose.model<ICheckIn>('CheckIn', CheckInSchema);

export default CheckIn;