"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';

import { useSession } from 'next-auth/react';

// Define a more specific type for Webinar if it's different from Prisma's directly
interface Webinar {
  id: string;
  title: string;
  slug: string;
  dateTime: string; // Or Date
  published: boolean;
  isFree: boolean;
  price?: number | null;
  platform?: string | null;
  category?: string | null;
  author?: {
    name?: string | null;
  } | null;
  createdAt: string; // Or Date
  _count?: { // For registration count
    registrations?: number;
  };
  // Add other fields you expect to list
}

interface WebinarListClientProps {
  initialWebinars: Webinar[];
  currentPage: number;
  totalPages: number;
  totalWebinars: number;
}

const ITEMS_PER_PAGE = 10;

export default function WebinarListClient({
  initialWebinars,
  currentPage: initialCurrentPage,
  totalPages: initialTotalPages,
  totalWebinars: initialTotalWebinars,
}: WebinarListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [webinars, setWebinars] = useState<Webinar[]>(initialWebinars);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalWebinars, setTotalWebinars] = useState(initialTotalWebinars);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState<string | null>(null); // Store ID of webinar being toggled

  // Effect to update state if props change (e.g., initial load from server on different page)
  useEffect(() => {
    setWebinars(initialWebinars);
    setCurrentPage(initialCurrentPage);
    setTotalPages(initialTotalPages);
    setTotalWebinars(initialTotalWebinars);
  }, [initialWebinars, initialCurrentPage, initialTotalPages, initialTotalWebinars]);

  // Function to fetch webinars - can be used for pagination and search
  async function fetchWebinars(page: number, search: string = '') {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (search) params.append('search', search);
      // Add other filters like 'published' if needed

      const res = await fetch(`/api/webinars?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch webinars');
      }
      const data = await res.json();
      setWebinars(data.webinars || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotalWebinars(data.totalWebinars || 0);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Could not load webinars.', 'error');
      setWebinars([]); // Clear webinars on error
    }
    setIsLoading(false);
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/admin/webinars?page=${newPage}${searchTerm ? `&search=${searchTerm}`: ''}`);
      // Data will be re-fetched by the parent server component or an effect here if desired
      // For now, relying on parent page to re-fetch and pass new props, or uncomment fetchWebinars call
      // fetchWebinars(newPage, searchTerm);
    }
  };

  const allowedRoles = ['ADMIN', 'CONTENT_ADMIN'];
  // Use the same allowedRoles for all permission checks
  const handleDelete = async (id: string, title: string) => {
    if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
      Swal.fire('Forbidden', 'You do not have permission to delete webinars.', 'error');
      return;
    }

    Swal.fire({
      title: `Delete ${title}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/webinars/${id}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Failed to delete webinar.' }));
            throw new Error(errorData.error || 'Failed to delete webinar.');
          }
          Swal.fire('Deleted!', `${title} has been deleted.`, 'success');
          // Refresh the list - either by re-fetching or removing from state
          // For simplicity, re-fetch current page. Could also filter out locally.
          fetchWebinars(currentPage, searchTerm);
        } catch (error: any) {
          Swal.fire('Error', error.message || 'Could not delete webinar.', 'error');
        }
      }
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Navigate to page 1 of search results
    router.push(`/admin/webinars?page=1&search=${searchTerm}`);
    // fetchWebinars(1, searchTerm);
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean, title: string) => {
    if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
      Swal.fire('Forbidden', 'You do not have permission to change publish status.', 'error');
      return;
    }

    const actionText = currentStatus ? 'unpublish' : 'publish';

    Swal.fire({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} ${title}?`,
      text: `Are you sure you want to ${actionText} this webinar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#f8bb86' : '#a5dc86', // Orange for unpublish, Green for publish
      cancelButtonColor: '#999',
      confirmButtonText: `Yes, ${actionText} it!`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsTogglingPublish(id);
        try {
          const res = await fetch(`/api/webinars/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ published: !currentStatus }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: `Failed to ${actionText} webinar.` }));
            throw new Error(errorData.error || `Failed to ${actionText} webinar.`);
          }

          Swal.fire(
            `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ed!`,
            `${title} has been ${actionText}ed.`, 
            'success'
          );
          fetchWebinars(currentPage, searchTerm); // Refresh the list
        } catch (error: any) {
          Swal.fire('Error', error.message || `Could not ${actionText} webinar.`, 'error');
        }
        setIsTogglingPublish(null);
      }
    });
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search webinars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-md flex items-center">
          <Search size={20} />
        </button>
      </form>

      {isLoading && <p className="text-center text-gray-600 py-4">Loading webinars...</p>}
      {!isLoading && webinars.length === 0 && (
        <p className="text-center text-gray-500 py-6 text-lg">No webinars found.</p>
      )}

      {!isLoading && webinars.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {webinars.map((webinar) => (
                <tr key={webinar.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{webinar.title}</div>
                    <div className="text-xs text-gray-500">{webinar.category || 'Uncategorized'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(webinar.dateTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${webinar.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {webinar.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{webinar._count?.registrations ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{webinar.author?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <Link href={`/webinar/${webinar.slug}`} passHref legacyBehavior>
                      <a target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800" title="View Public Page">
                        <Eye size={18} />
                      </a>
                    </Link>
                    <Link href={`/admin/webinars/${webinar.id}`} passHref legacyBehavior>
                      <a className="text-gray-600 hover:text-gray-800" title="View Details & Registrants">
                        <ClipboardList size={18} />
                      </a>
                    </Link>
                    <Link href={`/admin/webinars/edit/${webinar.id}`} passHref legacyBehavior>
                      <a className="text-indigo-600 hover:text-indigo-800" title="Edit Webinar">
                        <Edit size={18} />
                      </a>
                    </Link>
                    <button
                      onClick={() => handleDelete(webinar.id, webinar.title)}
                      className="text-red-600 hover:text-red-800" title="Delete Webinar"
                    >
                      <Trash2 size={18} />
                    </button>

                    {/* Publish/Unpublish Button */}
                    <button
                      onClick={() => handleTogglePublish(webinar.id, webinar.published, webinar.title)}
                      disabled={isTogglingPublish === webinar.id}
                      className={`p-2 rounded-md shadow-sm transition-colors text-white flex items-center justify-center 
                        ${webinar.published 
                          ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' 
                          : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={webinar.published ? 'Unpublish Webinar' : 'Publish Webinar'}
                    >
                      {isTogglingPublish === webinar.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : webinar.published ? (
                        <XCircle size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                    </button>
                  </td>
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
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages} (Total: {totalWebinars} webinars)
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
