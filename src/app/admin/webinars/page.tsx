import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client'; // Assuming Webinar type is available from prisma
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import WebinarListClient from '@/components/admin/webinars/WebinarListClient';

// Define a more specific type for Webinar if it's different from Prisma's directly
// For now, assuming Prisma's Webinar type is sufficient or will be augmented by API
interface Webinar {
  id: string;
  title: string;
  slug: string;
  dateTime: string; // Or Date
  published: boolean;
  createdAt: string; // Or Date
  isFree: boolean;
  author?: { // Optional author details if included from API
    name?: string | null;
  } | null;
  // Add other fields you expect to list
}


interface FetchedWebinarsResponse {
  webinars: Webinar[];
  currentPage: number;
  totalPages: number;
  totalWebinars: number;
}

async function getWebinars(page: number = 1, limit: number = 10): Promise<FetchedWebinarsResponse | null> {
  const session = await auth();
  if (!session?.user?.id) {
    console.error('No session or user ID found in getWebinars');
    return null;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/webinars?page=${page}&limit=${limit}`;
    console.log(`Fetching webinars from: ${apiUrl}`);

    const res = await fetch(apiUrl, {
      // Headers might be needed if your API is protected beyond session cookies handled by Next.js
      // e.g., if you were passing a JWT directly:
      // headers: { 'Authorization': `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Failed to fetch webinars:', res.status, errorBody);
      return null;
    }
    const data = await res.json();
    console.log('Successfully fetched webinars:', data.totalWebinars);
    return data;
  } catch (error) {
    console.error('Error in getWebinars catch block:', error);
    return null;
  }
}

export default async function AdminWebinarsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const session = await auth();

  const allowedRoles: Role[] = [Role.ADMIN, Role.CONTENT_ADMIN];
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    redirect('/unauthorized'); // Or your login page e.g. /auth/signin
  }

  const currentPage = Number(searchParams?.page) || 1;
  const webinarData = await getWebinars(currentPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Manage Webinars</h1>
        <Link href="/admin/webinars/new" legacyBehavior>
          <a className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-150 ease-in-out flex items-center space-x-2">
            <PlusCircle size={20} />
            <span>Add New Webinar</span>
          </a>
        </Link>
      </div>

      {webinarData ? (
        <WebinarListClient 
          initialWebinars={webinarData.webinars}
          currentPage={webinarData.currentPage}
          totalPages={webinarData.totalPages}
          totalWebinars={webinarData.totalWebinars}
        />
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Failed to load webinars. Please try again later or check server logs.</span>
        </div>
      )}
    </div>
  );
}
