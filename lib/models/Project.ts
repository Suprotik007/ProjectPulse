import mongoose, { Schema, Model } from 'mongoose';
import { IProject } from '../types';

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value: Date) {
          return value > this.get('startDate');
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: ['On Track', 'At Risk', 'Critical', 'Completed'],
      default: 'On Track',
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    employeeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ healthScore: 1 });
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ employeeIds: 1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;