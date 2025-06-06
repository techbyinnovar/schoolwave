'use client';

import React from 'react';
// Custom types for client-side data
interface ExtendedLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  schoolName?: string | null;
}

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
}

interface ExtendedWebinarRegistration {
  id: string;
  attended: boolean | null;
  registeredAt: string;
  paymentStatus?: string | null;
  lead: ExtendedLead;
  user?: ExtendedUser | null;
}

interface WebinarDetailsClientProps {
  webinar: {
    id: string;
    title: string;
    subtitle?: string | null;
    dateTime: string;
    durationMinutes: number;
    platform: string;
    published: boolean;
    registrationOpen: boolean;
    isFree: boolean;
    price: number;
  };
  registrations: ExtendedWebinarRegistration[];
}

import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Define more specific types for props
interface ExtendedLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  schoolName?: string | null;
}

interface ExtendedUser {
  id: string;
  name: string;
  email: string;
}

// Assuming WebinarRegistration is correctly imported from '@prisma/client' after 'npx prisma generate'
interface ExtendedWebinarRegistration {
  id: string;
  attended: boolean | null;
  registeredAt: string;
  paymentStatus?: string | null;
  lead: ExtendedLead;
  user?: ExtendedUser | null;
}

interface WebinarDetailsClientProps {
  webinar: {
    id: string;
    title: string;
    subtitle?: string | null;
    dateTime: string;
    durationMinutes: number;
    platform: string;
    published: boolean;
    registrationOpen: boolean;
    isFree: boolean;
    price: number;
    // Add any other fields used in your component
  };
  registrations: ExtendedWebinarRegistration[];
}

const WebinarDetailsClient: React.FC<WebinarDetailsClientProps> = ({ webinar, registrations }) => {
  const getStatusBadgeClass = (status: boolean, open?: boolean) => {
    if (open === true) return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'; // Open
    if (open === false) return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'; // Closed
    return status ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'; // Published/Draft or Yes/No
  };

  const getPaymentStatusBadgeClass = (paymentStatus: string | null | undefined, isFree: boolean) => {
    if (isFree && !paymentStatus) return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'; // Free
    if (paymentStatus === 'PAID') return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
    if (paymentStatus === 'PENDING_PAYMENT') return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
    return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'; // Default / N/A
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Link href="/admin/webinars" className="mb-6 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Webinars
      </Link>

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8 mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{webinar.title}</h1>
          {webinar.subtitle && <p className="text-lg text-gray-600 mt-1">{webinar.subtitle}</p>}
        </div>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
          <div><strong>Date & Time:</strong> {format(new Date(webinar.dateTime), 'PPP p')}</div>
          <div><strong>Duration:</strong> {webinar.durationMinutes} minutes</div>
          <div><strong>Platform:</strong> {webinar.platform}</div>
          <div><strong>Status:</strong> <span className={getStatusBadgeClass(webinar.published)}>{webinar.published ? 'Published' : 'Draft'}</span></div>
          <div><strong>Registration:</strong> <span className={getStatusBadgeClass(webinar.registrationOpen, webinar.registrationOpen)}>{webinar.registrationOpen ? 'Open' : 'Closed'}</span></div>
          <div><strong>Price:</strong> {webinar.isFree ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">FREE</span> : `$${webinar.price}` }</div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
        <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Registrations ({registrations.length})</h2>
            <p className="text-sm text-gray-600 mt-1">List of individuals registered for this webinar.</p>
        </div>
        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reg.lead.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.lead.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.lead.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reg.lead.schoolName || 'N/A'} {/* Assuming schoolName is organization */}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{format(new Date(reg.registeredAt), 'PP p')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getPaymentStatusBadgeClass(reg.paymentStatus, webinar.isFree)}>
                        {reg.paymentStatus || (webinar.isFree ? 'FREE' : 'N/A')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadgeClass(reg.attended ?? false)}>
                        {reg.attended ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/leads/${reg.lead.id}`} className="text-indigo-600 hover:text-indigo-800 px-3 py-1 border border-indigo-600 rounded-md text-xs hover:bg-indigo-50 transition-colors">
                        View Lead
                      </Link>
                      {/* <button className="ml-2 text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded-md text-xs hover:bg-green-50 transition-colors">Mark Attended</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6 text-lg">No registrations yet for this webinar.</p>
        )}
      </div>
    </div>
  );
};

export default WebinarDetailsClient;
