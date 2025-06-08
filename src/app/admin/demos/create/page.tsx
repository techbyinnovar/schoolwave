import CreateDemoForm from '@/components/admin/demos/CreateDemoForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Demo | Admin',
  description: 'Add a new demo to the platform.',
};

export default async function CreateDemoPage() {
  // Add any necessary server-side logic here, e.g., role checks for page access
  // For example, you might want to redirect if the user is not an admin:
  // const session = await auth();
  // if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.CONTENT_ADMIN)) {
  //   redirect('/auth/signin'); // Or to an unauthorized page
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Demo</h1>
      <div className="max-w-4xl mx-auto">
        <CreateDemoForm />
      </div>
    </div>
  );
}
