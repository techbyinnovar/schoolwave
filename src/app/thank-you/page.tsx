"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function formatDateTime(dateString?: string, timeString?: string) {
  if (!dateString) return '[Day]';
  // Try to combine date and time into a single Date object
  let date;
  if (dateString && timeString) {
    // Support both 'YYYY-MM-DD' and 'YYYY-MM-DD HH:mm' formats
    const iso = timeString.match(/^\d{2}:\d{2}/)
      ? `${dateString}T${timeString}`
      : `${dateString} ${timeString}`;
    date = new Date(iso);
    if (isNaN(date.getTime())) {
      // fallback: try just date
      date = new Date(dateString);
    }
  } else {
    date = new Date(dateString);
  }
  if (isNaN(date.getTime())) return '[Invalid Date]';

  // Format: Wed 25th April 2025 10:30am
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  // Suffix for day
  const nth = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  let hours = date.getHours();
  const mins = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${dayOfWeek} ${day}${nth(day)} ${month} ${year} ${hours}:${mins}${ampm}`;
}

interface ThankYouProps {
  searchParams?: { day?: string; time?: string };
}

export default function ThankYou({ searchParams }: ThankYouProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const day = searchParams?.day;
  const time = searchParams?.time;
  const formattedDate = formatDateTime(day, time);

  return (
    <div className="min-h-screen flex flex-col bg-[#00164E] bg-[url('/sch_elementwhite.png')] bg-contain bg-center">
      <div className="relative bg-cover bg-center bg-no-repeat flex-1 flex flex-col">
        <div className="absolute inset-0 bg-contain grad"></div>
        <div className="relative z-10 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
          <Image src="/schoolwave.png" alt="Schoolwave Logo" width={120} height={120} className="mb-8 rounded-full shadow-lg" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
            Thank You for Booking a Demo with us
          </h1>
          <div className="max-w-xl text-center text-lg text-gray-700 bg-blue-50 border border-blue-100 rounded-2xl px-8 py-8 shadow-lg mb-8">
            <p className="mb-6">
              Your demo is scheduled for <span className="font-semibold text-blue-700">{formattedDate}</span>.
            </p>
            <p className="mb-2">
              <span className="font-semibold text-blue-700">A Sales Engineer will be in touch</span>
            </p>
          </div>
          <Link href="/" className="mt-4 px-6 py-3 rounded-full bg-white text-[#0045f6] font-semibold shadow hover:bg-blue-100 transition">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
