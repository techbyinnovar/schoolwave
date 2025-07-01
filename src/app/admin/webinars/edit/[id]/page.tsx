import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client'; // Removed incorrect Webinar import

// Define a custom type for webinar data
interface WebinarType {
  id: string;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  maxAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Allow for additional properties from API
}
import EditWebinarForm from '@/components/admin/webinars/EditWebinarForm'; // We'll create this next
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditWebinarPageProps {
  params: {
    id: string;
  };
}

async function getWebinar(id: string): Promise<WebinarType | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/webinars/${id}`, {
      cache: 'no-store', // Ensure fresh data for editing
    });

    if (!res.ok) {
      if (res.status === 404) return null; // Webinar not found
      console.error('Failed to fetch webinar:', res.status, await res.text());
      // Throw an error or return null to indicate a fetch problem other than 404
      throw new Error(`Failed to fetch webinar data: ${res.status}`); 
    }
    return res.json();
  } catch (error) {
    console.error(`Error in getWebinar(${id}):`, error);
    // Depending on how you want to handle errors, you might re-throw or return null
    // For a page component, re-throwing might lead to an error boundary or Next.js error page
    throw error; 
  }
}

export default async function EditWebinarPage({ params }: EditWebinarPageProps) {
  console.log('DEBUG: EditWebinarPage - Component Invoked. Params ID:', params?.id);
  try {
    const session = await auth();

    // Debugging role comparison
    console.log(`DEBUG: EditWebinarPage - session.user.role: ${session?.user?.role} (type: ${typeof session?.user?.role})`);
    console.log(`DEBUG: EditWebinarPage - Role.ADMIN: ${Role.ADMIN} (type: ${typeof Role.ADMIN})`);
    console.log(`DEBUG: EditWebinarPage - Role.CONTENT_ADMIN: ${Role.CONTENT_ADMIN} (type: ${typeof Role.CONTENT_ADMIN})`);
    console.log(`DEBUG: EditWebinarPage - Comparison 1 (ADMIN): ${session?.user?.role !== Role.ADMIN}`);
    console.log(`DEBUG: EditWebinarPage - Comparison 2 (CONTENT_ADMIN): ${session?.user?.role !== Role.CONTENT_ADMIN}`);

    if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
      console.log('DEBUG: EditWebinarPage - Redirecting to /unauthorized due to role mismatch or no session.');
      redirect('/unauthorized');
    }
    console.log('DEBUG: EditWebinarPage - Authorization check passed.');
  } catch (error) {
    console.error('DEBUG: EditWebinarPage - ERROR during session check/auth:', error);
    // Optionally redirect to an error page or unauthorized page if session check itself fails catastrophically
    redirect('/unauthorized'); // Or a generic error page
  }

  const { id } = params;
  let webinar: WebinarType | null = null;
  let fetchError: string | null = null;

  try {
    webinar = await getWebinar(id);
  } catch (error: any) {
    console.error(`Failed to load webinar ${id} for editing:`, error);
    fetchError = error.message || 'An unexpected error occurred while fetching webinar data.';
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Webinar</h1>
        <p className="text-gray-700">{fetchError}</p>
        <Link href="/admin/webinars" legacyBehavior>
          <a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Back to Webinars List
          </a>
        </Link>
      </div>
    );
  }
  
  if (!webinar) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-500 mb-4">Webinar Not Found</h1>
        <p className="text-gray-600">The webinar you are trying to edit (ID: {id}) does not exist.</p>
        <Link href="/admin/webinars" legacyBehavior>
          <a className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
            Back to Webinars List
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/webinars" legacyBehavior>
          <a className="text-blue-600 hover:text-blue-800 inline-flex items-center">
            <ArrowLeft size={18} className="mr-2" />
            Back to Webinars
          </a>
        </Link>
      </div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Edit Webinar</h1>
      <EditWebinarForm webinar={webinar} />
    </div>
  );
}
