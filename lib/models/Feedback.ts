import mongoose, { Schema, Model } from 'mongoose';
import { IFeedback } from '../types';

const FeedbackSchema = new Schema<IFeedback>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client is required'],
    },
    weekStartDate: {
      type: Date,
      required: [true, 'Week start date is required'],
    },
    satisfactionRating: {
      type: Number,
      required: [true, 'Satisfaction rating is required'],
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      default: '',
      trim: true,
    },
    issueFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ projectId: 1, clientId: 1, weekStartDate: 1 }, { unique: true });
FeedbackSchema.index({ projectId: 1, createdAt: -1 });
FeedbackSchema.index({ clientId: 1, createdAt: -1 });

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;