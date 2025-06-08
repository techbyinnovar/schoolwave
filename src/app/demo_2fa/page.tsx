// No longer needs to be a client component at the page level if all client logic is in Demo2FAForm
// "use client"; 

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Demo2FAForm from './Demo2FAForm'; // Import the new form component
import { Suspense } from 'react'; // Import Suspense

// Removed: export const dynamic = 'force-dynamic'; // Suspense should handle this

export default function Demo2FAPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Suspense fallback={<div className="text-center"><p>Loading form...</p></div>}>
          <Demo2FAForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
