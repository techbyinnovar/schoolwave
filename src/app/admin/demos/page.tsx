import DemoListClient from '@/components/admin/demos/DemoListClient';
import { Metadata } from 'next';
// import { auth } from '@/auth'; // Uncomment if using for role checks
// import { Role } from '@prisma/client'; // Uncomment if using for role checks
// import { redirect } from 'next/navigation'; // Uncomment if using for role checks

export const metadata: Metadata = {
  title: 'Manage Demos | Admin',
  description: 'View, create, edit, and delete demos.',
};

export default async function AdminDemosPage() {
  // Server-side role check (example)
  // const session = await auth();
  // if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
  //   redirect('/auth/signin'); // Or to an unauthorized page
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* You can add a page title or other server-rendered elements here if needed */}
      {/* For example: <h1 className="text-3xl font-bold mb-6 text-gray-800">Demos Dashboard</h1> */}
      <DemoListClient />
    </div>
  );
}
