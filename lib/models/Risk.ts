import mongoose, { Schema, Model } from 'mongoose';
import { IRisk } from '../types';

const RiskSchema = new Schema<IRisk>(
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
    title: {
      type: String,
      required: [true, 'Risk title is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Severity is required'],
    },
    mitigationPlan: {
      type: String,
      required: [true, 'Mitigation plan is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved'],
      default: 'Open',
    },
  },
  {
    timestamps: true,
  }
);

RiskSchema.index({ projectId: 1, status: 1 });
RiskSchema.index({ severity: 1, status: 1 });
RiskSchema.index({ createdAt: -1 });

const Risk: Model<IRisk> = mongoose.models.Risk || mongoose.model<IRisk>('Risk', RiskSchema);

export default Risk;