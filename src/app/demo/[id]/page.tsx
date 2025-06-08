import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import DemoDetailClient from '@/components/demo/DemoDetailClient'; // We'll create/update this next
import { Metadata } from 'next';
import { Demo } from '@prisma/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}

interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const demo = await prisma.demo.findUnique({
    where: { id: params.id, published: true }, // Only generate metadata for published demos
    select: { title: true, description: true },
  });

  if (!demo) {
    return {
      title: 'Demo Not Found | Schoolwave',
    };
  }

  return {
    title: `${demo.title} | Schoolwave Demos`,
    description: demo.description || `Watch our demo: ${demo.title}`,
  };
}

async function getDemo(id: string): Promise<DemoWithParsedVideos | null> {
  const demo = await prisma.demo.findUnique({
    where: { id: id, published: true }, // Ensure only published demos are fetched
  });

  if (!demo) return null;

  let parsedVideos: DemoVideo[] | null = null;
  if (demo.videos && typeof demo.videos === 'string') {
    try {
      parsedVideos = JSON.parse(demo.videos);
    } catch (e) {
      console.error(`Failed to parse videos JSON for demo ${demo.id}:`, e);
    }
  } else if (Array.isArray(demo.videos)) {
    parsedVideos = demo.videos as unknown as DemoVideo[];
  }

  return { ...demo, videos: parsedVideos };
}

export default async function DemoDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const demo = await getDemo(id);

  if (!demo) {
    notFound(); // Triggers the not-found.tsx page
  }

  return (
    <div >
      
     <div className='bg-[#00164E] mb-6 sticky top-0 z-50'> {/* Made header sticky */}
            <Header />
          </div>
          <div className='w-[75%]'>

    <DemoDetailClient demo={demo} />
          </div>
    <Footer />
    </div>
  );
}

// Optional: Generate static paths if you have a small number of demos and want to pre-render them
// export async function generateStaticParams() {
//   const demos = await prisma.demo.findMany({
//     where: { published: true },
//     select: { id: true },
//   });
//   return demos.map((demo) => ({ id: demo.id }));
// }
