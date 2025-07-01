import { db } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getRequests() {
  // Fetch all requests with their associated lead
  return db.request.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      Lead: true, // Fix: Capitalize 'Lead' to match the Prisma schema
    },
  });
}

export default async function RequestsPage() {
  const requests = await getRequests();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Requests</h1>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Lead Name</th>
            <th className="px-4 py-2 border">Lead Email</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Details</th>
            <th className="px-4 py-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="px-4 py-2 border font-semibold">{req.type}</td>
              <td className="px-4 py-2 border">{req.Lead?.name || '-'}</td>
              <td className="px-4 py-2 border">{req.Lead?.email || '-'}</td>
              <td className="px-4 py-2 border">{req.Lead?.phone || '-'}</td>
              <td className="px-4 py-2 border text-xs">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(req.details, null, 2)}</pre>
              </td>
              <td className="px-4 py-2 border">{new Date(req.requestedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
