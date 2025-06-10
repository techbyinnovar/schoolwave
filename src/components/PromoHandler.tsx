'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PromoPopup from './PromoPopup';

const PromoHandler = () => {
  const [showPopup, setShowPopup] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const promoParam = searchParams.get('promo');
    const hasSeenPromo = sessionStorage.getItem('hasSeenPromo');

    if (promoParam === 'true' && !hasSeenPromo) {
      setShowPopup(true);
      sessionStorage.setItem('hasSeenPromo', 'true');
    }

    // Clean the URL by removing the 'promo' query parameter
    // This runs regardless of whether the popup was shown, to ensure URL is clean if param exists
    if (promoParam) {
      const newPath = window.location.pathname; // current path without query params
      router.replace(newPath); 
    }
  }, [searchParams, router]);

  if (!showPopup) {
    return null;
  }

  return <PromoPopup isOpen={showPopup} onClose={() => setShowPopup(false)} />;
};

export default PromoHandler;
