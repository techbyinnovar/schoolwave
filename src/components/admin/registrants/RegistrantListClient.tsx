'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define types matching the server component
interface Registrant {
  id: string;
  registeredAt: string;
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

interface Webinar {
  id: string;
  title: string;
}

interface RegistrantListClientProps {
  initialRegistrants: Registrant[];
  currentPage: number;
  totalPages: number;
  totalRegistrants: number;
  allWebinars: Webinar[];
}

export default function RegistrantListClient({
  initialRegistrants,
  currentPage,
  totalPages,
  totalRegistrants,
  allWebinars
}: RegistrantListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedWebinar, setSelectedWebinar] = useState(searchParams.get('webinarId') || '');

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const webinarId = e.target.value;
    setSelectedWebinar(webinarId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to first page on filter change
    if (webinarId) {
      params.set('webinarId', webinarId);
    } else {
      params.delete('webinarId');
    }
    router.push(`/admin/registrants?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/registrants?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
      <div className="mb-6">
        <label htmlFor="webinar-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Webinar:
        </label>
        <select
          id="webinar-filter"
          value={selectedWebinar}
          onChange={handleFilterChange}
          className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Webinars</option>
          {allWebinars.map((webinar) => (
            <option key={webinar.id} value={webinar.id}>
              {webinar.title}
            </option>
          ))}
        </select>
      </div>

      {initialRegistrants.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-lg">No registrants found for the selected filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Webinar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialRegistrants.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>{reg.lead.email}</div>
                    <div className="text-xs text-gray-500">{reg.lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.lead.schoolName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.webinar.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(reg.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} (Total: {totalRegistrants} registrants)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
