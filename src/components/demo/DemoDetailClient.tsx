'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Demo } from '@prisma/client'; // Assuming Demo type is available
import { PlayCircleIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { NoSymbolIcon } from '@heroicons/react/24/outline';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}

interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

interface DemoDetailClientProps {
  demo: DemoWithParsedVideos;
}

// Helper to generate Cloudinary thumbnail URL
const getCloudinaryThumbnail = (videoUrl: string) => {
  if (!videoUrl || !videoUrl.includes('cloudinary.com')) {
    return '/images/placeholder-video-thumb.png'; // Fallback for non-Cloudinary or missing URLs
  }
  // Basic transformation: change extension to .jpg for thumbnail
  // More advanced: fetch specific frame, resize, etc. e.g. /f_auto,q_auto,w_400,h_300,c_thumb,g_center/video.jpg
  return videoUrl.replace(/\.(mp4|webm|mov|avi|flv|mkv)$/i, '.jpg');
};

const DemoDetailClient: React.FC<DemoDetailClientProps> = ({ demo }) => {
  const [selectedVideo, setSelectedVideo] = useState<DemoVideo | null>(null);

  const openModal = (video: DemoVideo) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  if (!demo) return <p>Demo data is not available.</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Demo Header */} 
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">{demo.title}</h1>
          {demo.description && (
            <p className="mt-3 md:mt-4 max-w-3xl mx-auto text-lg md:text-xl text-gray-600">
              {demo.description}
            </p>
          )}
        </div>

        {/* Cover Image - Display if available and no videos, or as a banner */} 
        {demo.coverImage && (!demo.videos || demo.videos.length === 0) && (
            <div className="mb-8 md:mb-12 rounded-lg shadow-xl overflow-hidden aspect-video max-w-4xl mx-auto">
                <Image 
                    src={demo.coverImage}
                    alt={`Cover image for ${demo.title}`}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
        )}

        {/* Videos Grid */} 
        {demo.videos && demo.videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {demo.videos.map((video, index) => (
              <div
                key={video.url + index} // Using URL + index as key, consider more stable ID if available
                className="group bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                onClick={() => openModal(video)}
              >
                <div className="relative w-full aspect-video bg-gray-200">
                  <Image
                    src={getCloudinaryThumbnail(video.url)}
                    alt={`Thumbnail for ${video.title}`}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircleIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors duration-300">
                    {video.title || `Video ${index + 1}`}
                  </h3>
                  {video.description && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <NoSymbolIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No videos available for this demo yet.</p>
            {/* If no videos and no cover image, this message will show. Consider specific message if coverImage exists but no videos. */}
          </div>
        )}
      </div>

      {/* Video Modal */} 
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 truncate">{selectedVideo.title}</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-200"
                aria-label="Close video player"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video src={selectedVideo.url} controls autoPlay className="w-full h-full" onContextMenu={(e) => e.preventDefault()}> 
                Your browser does not support the video tag.
              </video>
            </div>
            {selectedVideo.description && (
                <div className="p-4 text-sm text-gray-700 bg-gray-50 overflow-y-auto max-h-24">
                    <InformationCircleIcon className="h-5 w-5 inline mr-1 text-blue-500 align-text-bottom" /> 
                    {selectedVideo.description}
                </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for animations (can be in a global CSS file) */} 
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleUp { animation: scaleUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default DemoDetailClient;
