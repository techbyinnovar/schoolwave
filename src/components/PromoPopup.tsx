"use client";

import React from 'react';
import Link from 'next/link';

interface PromoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromoPopup: React.FC<PromoPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h2 className="text-xl md:text-2xl font-bold text-[#0045F6] mb-4">
          Get 20% Off SchoolWave – Limited Time Offer!
        </h2>
        <p className="text-gray-700 mb-3 text-sm md:text-base">
          Want to see how SchoolWave can simplify your school operations?
        </p>
        <p className="text-gray-700 mb-6 text-sm md:text-base">
          Click below to watch our quick demo and unlock your 20% discount!
        </p>
        
        <Link href="/get_demo_code" passHref legacyBehavior>
          <a 
            onClick={onClose} // Close popup when demo link is clicked
            className="inline-block bg-[#FFD700] hover:bg-yellow-500 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 mb-4 text-sm md:text-base"
          >
            Watch Our Quick Demo
          </a>
        </Link>

        <p className="text-gray-600 font-semibold mb-6 text-sm md:text-base">
          👉 Don’t miss out—this offer won&apos;t last long!
        </p>
        
        <button
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out text-sm md:text-base"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PromoPopup;
