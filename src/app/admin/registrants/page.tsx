import { auth } from '../../../../auth';
import { redirect } from 'next/navigation';
import { Role, webinar_registrations, webinars as Webinar } from '@prisma/client';
import RegistrantListClient from '@/components/admin/registrants/RegistrantListClient';
import { headers } from 'next/headers';

// Define types for the data we're fetching
interface Registrant {
  id: string;
  registeredAt: string; // or Date
  lead: {
    name: string;
    email: string;
    phone: string;
    schoolName: string;
  };
  webinar: {
    title: string;
    slug: string;
  };
}



interface FetchedRegistrantsResponse {
  registrants: Registrant[];
  currentPage: number;
  totalPages: number;
  totalRegistrants: number;
}

interface FetchedWebinarsResponse {
  webinars: Webinar[];
}

// Function to fetch registrants
async function getRegistrants(page: number = 1, webinarId?: string): Promise<FetchedRegistrantsResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams({ page: page.toString(), limit: '15' });
  if (webinarId) {
    params.append('webinarId', webinarId);
  }

  const apiUrl = `${baseUrl}/api/admin/registrants?${params.toString()}`;
  console.log('[AdminRegistrantsPage] Fetching registrants from:', apiUrl);

  try {
    const requestHeaders = headers(); // Get incoming request headers
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Cookie': requestHeaders.get('cookie') || '', // Forward cookies
      },
    });
    console.log('[AdminRegistrantsPage] Response status:', res.status, 'OK:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[AdminRegistrantsPage] Failed to fetch registrants. Status:', res.status, 'Response:', errorText);
      return null;
    }

    // Clone the response to be able to read it twice (once for JSON, once for text if JSON fails)
    const resClone = res.clone();
    try {
      const data = await res.json();
      console.log('[AdminRegistrantsPage] Successfully fetched and parsed registrants:', data);
      return data;
    } catch (jsonError) {
      console.error('[AdminRegistrantsPage] Failed to parse JSON response:', jsonError);
      const rawText = await resClone.text(); // Read from the clone
      console.error('[AdminRegistrantsPage] Raw response text:', rawText);
      return null;
    }
  } catch (error) {
    console.error('[AdminRegistrantsPage] Network or other error in getRegistrants:', error);
    return null;
  }
}

// Function to fetch all webinars for the filter dropdown
async function getAllWebinars(): Promise<Webinar[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Fetch all webinars by setting a very high limit
  const apiUrl = `${baseUrl}/api/webinars?limit=1000`; 

  try {
    const res = await fetch(apiUrl, { cache: 'no-store' }); // Use no-store to get latest
    if (!res.ok) {
      console.error('Failed to fetch webinars for filter:', res.status, await res.text());
      return [];
    }
    const data: FetchedWebinarsResponse = await res.json();
    return data.webinars;
  } catch (error) {
    console.error('Error in getAllWebinars:', error);
    return [];
  }
}

export default async function AdminRegistrantsPage({ searchParams }: { searchParams?: { page?: string; webinarId?: string } }) {
  const session = await auth();
  const allowedRoles: Role[] = [Role.ADMIN, Role.CONTENT_ADMIN];
  if (!session?.user || !allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized');
  }

  const currentPage = Number(searchParams?.page) || 1;
  const webinarId = searchParams?.webinarId;

  const [registrantData, allWebinars] = await Promise.all([
    getRegistrants(currentPage, webinarId),
    getAllWebinars(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Webinar Registrants</h1>
      </div>

      {registrantData ? (
        <RegistrantListClient 
          initialRegistrants={registrantData.registrants}
          currentPage={registrantData.currentPage}
          totalPages={registrantData.totalPages}
          totalRegistrants={registrantData.totalRegistrants}
          allWebinars={allWebinars}
        />
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Failed to load registrants. Please try again later.</span>
        </div>
      )}
    </div>
  );
}
