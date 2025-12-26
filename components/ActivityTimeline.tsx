'use client';

import { FC } from 'react';
import {
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface Actor {
  _id: string;
  name: string;
  role: string;
}

interface TimelineItem {
  _id: string;
  type: 'checkin' | 'feedback' | 'risk' | 'status';
  title: string;
  description?: string;
  createdAt: string;
  actor?: Actor | null;
  meta?: Record<string, any>;
}

interface Props {
  items: TimelineItem[];
  viewerRole: 'Admin' | 'Employee' | 'Client';
}

const icons = {
  checkin: <CheckCircle className="h-5 w-5 text-green-600" />,
  feedback: <MessageSquare className="h-5 w-5 text-blue-600" />,
  risk: <AlertTriangle className="h-5 w-5 text-red-600" />,
  status: <Activity className="h-5 w-5 text-purple-600" />,
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const ActivityTimeline: FC<Props> = ({ items, viewerRole }) => {
  if (!items || items.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-6 bg-white text-center text-gray-500">
        No activity yet for this project.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Project Activity
      </h2>

      <div className="relative pl-6 space-y-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />

        {items.map((item) => (
          <div key={item._id} className="relative flex gap-4">
            {/* Icon */}
            <div className="absolute -left-1 flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full">
              {icons[item.type]}
            </div>

            {/* Content */}
            <div className="ml-8 w-full">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {item.title}
                  </p>

                  {item.actor && (
                    <p className="text-sm text-gray-500">
                      {item.actor.name} • {item.actor.role}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </p>
              </div>

              {item.description && (
                <p className="mt-2 text-sm text-gray-700">
                  {item.description}
                </p>
              )}

              {/* Role-based meta */}
              {viewerRole !== 'Client' && item.meta && (
                <div className="mt-2 text-xs text-gray-500 flex gap-4 flex-wrap">
                  {item.meta.confidenceLevel !== undefined && (
                    <span>
                      Confidence: {item.meta.confidenceLevel}/5
                    </span>
                  )}
                  {item.meta.completionPercentage !== undefined && (
                    <span>
                      Completion: {item.meta.completionPercentage}%
                    </span>
                  )}
                  {item.meta.severity && (
                    <span className="capitalize">
                      Severity: {item.meta.severity}
                    </span>
                  )}
                  {item.meta.status && (
                    <span className="capitalize">
                      Status: {item.meta.status}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
