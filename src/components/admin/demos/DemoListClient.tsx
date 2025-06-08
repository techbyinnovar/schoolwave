'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Demo } from '@prisma/client'; // Assuming Demo type is available
import { EyeIcon, PencilSquareIcon, TrashIcon, PlusCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface DemoVideo {
  url: string;
  title: string;
  description?: string | null;
}

interface DemoWithParsedVideos extends Omit<Demo, 'videos'> {
  videos: DemoVideo[] | null;
}

interface FetchedDemosResponse {
  demos: DemoWithParsedVideos[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const DemoListClient: React.FC = () => {
  const [demos, setDemos] = useState<DemoWithParsedVideos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // Future: for search functionality
  const router = useRouter();

  const fetchDemos = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Add search/filter params to the API call if implementing search
      const response = await fetch(`/api/demos?page=${page}&limit=10`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch demos');
      }
      const data: FetchedDemosResponse = await response.json();
      
      // Parse the videos JSON string for each demo if it's not already an object
      const parsedDemos = data.demos.map(demo => {
        let parsedVideos: DemoVideo[] | null = null;
        if (demo.videos && typeof demo.videos === 'string') {
          try {
            parsedVideos = JSON.parse(demo.videos);
          } catch (e) {
            console.error('Failed to parse videos JSON for demo:', demo.id, e);
            // Keep videos as null or an empty array if parsing fails
          }
        } else if (Array.isArray(demo.videos)) {
            parsedVideos = demo.videos as unknown as DemoVideo[]; // Assume it's already in the correct format
        }
        return { ...demo, videos: parsedVideos };
      });

      setDemos(parsedDemos);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Add dependencies if searchTerm is used in API call

  useEffect(() => {
    fetchDemos(currentPage);
  }, [currentPage, fetchDemos]);

  const handleDelete = async (id: string, title: string) => {
    Swal.fire({
      title: `Delete Demo: ${title}?`,
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/demos/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete demo');
          }
          Swal.fire('Deleted!', 'Demo has been deleted.', 'success');
          fetchDemos(currentPage); // Refresh the list
          router.refresh(); // Refresh server components if needed
        } catch (e: any) {
          Swal.fire('Error!', e.message || 'Failed to delete demo.', 'error');
        }
      }
    });
  };

  const handleRefresh = () => {
    fetchDemos(currentPage);
  };

  if (isLoading && demos.length === 0) {
    return <div className="flex justify-center items-center h-64"><ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" /> <span className="ml-2">Loading demos...</span></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-100 rounded-md">Error: {error} <button onClick={handleRefresh} className='ml-2 text-indigo-600 hover:text-indigo-800'>Try again</button></div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Demo Management</h2>
        {/* Future: Add search input here */}
        <div className='flex space-x-2'>
            <button 
                onClick={handleRefresh}
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" 
                title="Refresh List"
                disabled={isLoading}
            >
                <ArrowPathIcon className={`h-6 w-6 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link href="/admin/demos/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Demo
            </Link>
        </div>
      </div>

      {demos.length === 0 && !isLoading ? (
        <p className="text-gray-500">No demos found. <Link href="/admin/demos/create" className="text-indigo-600 hover:underline">Create one now</Link>.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Videos</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demos.map((demo) => (
                <tr key={demo.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{demo.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demo.videos?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{demo.priority ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${demo.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {demo.published ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link href={`/demo/${demo.id}`} target="_blank" className="text-blue-600 hover:text-blue-900" title="View Public Page">
                      <EyeIcon className="h-5 w-5 inline" />
                    </Link>
                    <Link href={`/admin/demos/edit/${demo.id}`} className="text-indigo-600 hover:text-indigo-900" title="Edit Demo">
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </Link>
                    <button onClick={() => handleDelete(demo.id, demo.title)} className="text-red-600 hover:text-red-900" title="Delete Demo">
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DemoListClient;
