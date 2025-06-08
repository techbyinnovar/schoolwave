import EditDemoForm from '@/components/admin/demos/EditDemoForm';
import { db as prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Demo } from '@prisma/client'; // Import the Demo type

// Optional: Function to generate metadata dynamically based on the demo
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const demo = await prisma.demo.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  if (!demo) {
    return {
      title: 'Demo Not Found | Admin',
    };
  }

  return {
    title: `Edit Demo: ${demo.title} | Admin`,
    description: `Edit details for the demo: ${demo.title}`,
  };
}

interface EditDemoPageProps {
  params: {
    id: string;
  };
}

async function getDemo(id: string): Promise<Demo | null> {
  const demo = await prisma.demo.findUnique({
    where: { id },
  });
  return demo;
}

export default async function EditDemoPage({ params }: EditDemoPageProps) {
  const { id } = params;
  const demo = await getDemo(id);

  if (!demo) {
    notFound(); // Triggers the not-found.tsx page or a default Next.js 404 page
  }

  // Role checks can be added here as well, similar to the create page
  // const session = await auth();
  // if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
  //   redirect('/auth/signin');
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Demo: {demo.title}</h1>
      <div className="max-w-4xl mx-auto">
        <EditDemoForm demo={demo} />
      </div>
    </div>
  );
}
