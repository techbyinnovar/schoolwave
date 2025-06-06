'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer'; // Assuming global Footer
import { CalendarDays, Clock } from 'lucide-react';

// Define the shape of the webinar data expected by this component
interface WebinarCardData {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  coverImage?: string | null;
  dateTime: Date | null; 
  // Add other fields if selected in page.tsx and needed here
}

interface WebinarListClientProps {
  webinars: WebinarCardData[];
}

const WebinarListClient: React.FC<WebinarListClientProps> = ({ webinars }) => {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Date TBD';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Time TBD';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 font-sans">
      <header className="bg-blue-700 text-white py-12 shadow-lg">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Explore Our Webinars</h1>
          <p className="mt-4 text-lg md:text-xl text-blue-200 max-w-2xl mx-auto">
            Discover insightful sessions designed to empower educators and administrators.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 md:py-16">
        {webinars.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-700">No Webinars Available</h2>
            <p className="mt-2 text-gray-500">Please check back later for upcoming webinars.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {webinars.map((webinar) => (
              <Link href={`/webinar/${webinar.slug}`} key={webinar.id} className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col">
                <div className="relative w-full h-56">
                  {webinar.coverImage ? (
                    <Image
                      src={webinar.coverImage}
                      alt={webinar.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <CalendarDays className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
                    {webinar.title}
                  </h3>
                  {webinar.subtitle && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                      {webinar.subtitle}
                    </p>
                  )}
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <CalendarDays className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{formatDate(webinar.dateTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{formatTime(webinar.dateTime)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WebinarListClient;
