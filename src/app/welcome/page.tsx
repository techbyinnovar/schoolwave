"use client";

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Welcome() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#00164E] bg-[url('/sch_elementwhite.png')] bg-contain bg-center">
      <div className="relative bg-cover bg-center bg-no-repeat flex-1 flex flex-col">
        <div className="absolute inset-0 bg-contain grad"></div>
        <div className="relative z-10 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
          <Image src="/schoolwave.png" alt="Schoolwave Logo" width={120} height={120} className="mb-8 rounded-full shadow-lg" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
            Welcome to Schoolwave...
          </h1>
          <div className="max-w-xl text-center text-lg text-gray-700 bg-blue-50 border border-blue-100 rounded-2xl px-8 py-8 shadow-lg mb-8">
            <p className="mb-6">
              A <span className="font-semibold text-blue-700">Customer Support Engineer</span> will reach out to you to help you set up your school.
            </p>
            <p className="mb-2">
              <span className="font-semibold text-blue-700">Check your welcome email for payment link</span>
            </p>
          </div>
          <Link href="/" className="mt-4 px-6 py-3 rounded-full bg-white text-[#0045f6] font-semibold shadow hover:bg-blue-100 transition">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
