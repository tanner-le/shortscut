import React, { useState } from 'react';
import { Video } from '@/types/contract';

interface VideoDeliverablesProps {
  contractId: string;
  videos: Video[];
  onVideoUpdate?: (video: Video) => void;
  onVideoAdd?: (video: Video) => void;
}

export default function VideoDeliverables({
  contractId,
  videos,
  onVideoUpdate,
  onVideoAdd,
}: VideoDeliverablesProps) {
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  
  const getStatusBadgeClass = (status: Video['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'scripting':
        return 'bg-indigo-100 text-indigo-800';
      case 'production':
        return 'bg-yellow-100 text-yellow-800';
      case 'editing':
        return 'bg-orange-100 text-orange-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Simple progress calculation based on status
  const calculateProgress = (status: Video['status']) => {
    const stages = ['planning', 'scripting', 'production', 'editing', 'review', 'completed'];
    const currentIndex = stages.indexOf(status);
    return Math.round(((currentIndex + 1) / stages.length) * 100);
  };

  const toggleExpand = (videoId: string) => {
    setExpandedVideoId(expandedVideoId === videoId ? null : videoId);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">Video Deliverables</h3>
      
      {videos.length === 0 ? (
        <div className="mt-4 rounded-md bg-gray-50 p-6 text-center">
          <p className="text-gray-500">No videos scheduled for this contract yet.</p>
          {onVideoAdd && (
            <button
              className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                // Add a new video with default values
                const newVideo: Video = {
                  id: `video-${Date.now()}`,
                  contractId,
                  title: 'New Video',
                  status: 'planning',
                  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                  revisionCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                onVideoAdd(newVideo);
              }}
            >
              Schedule New Video
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg divide-y divide-gray-200">
          {videos.map((video) => (
            <div key={video.id} className="bg-white">
              <div 
                className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(video.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                        video.status
                      )}`}
                    >
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{video.title}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Due: {formatDate(video.dueDate)}
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedVideoId === video.id ? 'transform rotate-180' : ''
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${calculateProgress(video.status)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {expandedVideoId === video.id && (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {video.description || 'No description provided'}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Revisions</dt>
                      <dd className="mt-1 text-sm text-gray-900">{video.revisionCount}</dd>
                    </div>
                    {video.deliveryDate && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Delivered On</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {formatDate(video.deliveryDate)}
                        </dd>
                      </div>
                    )}
                    {video.feedback && video.feedback.length > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <ul className="list-disc pl-5 space-y-1">
                            {video.feedback.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                  
                  {onVideoUpdate && (
                    <div className="mt-4 flex space-x-3">
                      <button
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => {
                          const currentStatusIndex = [
                            'planning',
                            'scripting',
                            'production',
                            'editing',
                            'review',
                            'completed',
                          ].indexOf(video.status);
                          
                          if (currentStatusIndex < 5) {
                            const newStatus = [
                              'planning',
                              'scripting',
                              'production',
                              'editing',
                              'review',
                              'completed',
                            ][currentStatusIndex + 1];
                            
                            onVideoUpdate({
                              ...video,
                              status: newStatus as Video['status'],
                              updatedAt: new Date().toISOString(),
                              ...(newStatus === 'completed' && { deliveryDate: new Date().toISOString() }),
                            });
                          }
                        }}
                        disabled={video.status === 'completed'}
                      >
                        {video.status === 'completed' ? 'Completed' : 'Move to Next Stage'}
                      </button>
                      
                      {video.status === 'review' && (
                        <button
                          className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                          onClick={() => {
                            const feedback = prompt('Enter feedback for this video:');
                            if (feedback) {
                              onVideoUpdate({
                                ...video,
                                status: 'editing',
                                feedback: [...(video.feedback || []), feedback],
                                revisionCount: video.revisionCount + 1,
                                updatedAt: new Date().toISOString(),
                              });
                            }
                          }}
                        >
                          Request Revision
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 