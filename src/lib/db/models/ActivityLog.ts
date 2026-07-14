import { Schema, model, Document } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  module: string;
  description: string;
  performedBy: string;
  performedByName: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    module: { type: String, required: true },
    description: { type: String, required: true },
    performedBy: { type: String, required: true },
    performedByName: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1 });

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
