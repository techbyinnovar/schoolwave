"use client"
import dynamic from 'next/dynamic';

// Dynamically import client components with no SSR
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });

type BlogLayoutProps = {
  children: React.ReactNode;
};

export default function BlogLayout({ children }: BlogLayoutProps) {
  console.log('BlogLayout rendering...');
  
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <div className='bg-[#00164E]'>
        <Header />
      </div>
      
      <main className='flex-grow'>
        {/* Debug element to ensure layout is rendering */}
        <div className='bg-yellow-100 p-2 text-center'>
          Blog Layout is working
        </div>
        
        {children}
      </main>

      <Footer />
    </div>
  );
}
