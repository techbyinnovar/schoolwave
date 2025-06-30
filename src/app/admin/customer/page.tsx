"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

function CustomerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [highlightedCustomerId, setHighlightedCustomerId] = useState<string | null>(null);

  // Handle URL parameters for customer highlighting
  useEffect(() => {
    const customerId = searchParams.get('customer');
    if (customerId) {
      setHighlightedCustomerId(customerId);
      // Auto-scroll to the highlighted customer
      setTimeout(() => {
        const element = document.getElementById(`customer-${customerId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [searchParams]);

  // Open modal when customer ID is in URL but modal is not shown
  useEffect(() => {
    const customerId = searchParams.get('customer');
    if (customerId && !showModal) {
      setSelectedCustomerId(customerId);
      setShowModal(true);
    }
  }, [searchParams, showModal]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create customer");
      setForm({});
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Function to open customer detail modal
  const openCustomerDetail = useCallback((customerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('customer', customerId);
    router.push(`${pathname}?${params.toString()}`);
    setSelectedCustomerId(customerId);
    setShowModal(true);
  }, [router, pathname, searchParams]);

  // Function to close the modal
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    // Remove the customer parameter from URL while preserving other params
    const params = new URLSearchParams(searchParams.toString());
    params.delete('customer');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  }, [router, pathname, searchParams]);

  // Modal component
  const CustomerModal = () => {
    if (!showModal || !selectedCustomerId) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Customer Details</h2>
            <button 
              onClick={handleCloseModal}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-0 h-[75vh]">
            <iframe 
              src={`/admin/customer/${selectedCustomerId}?embed=1`}
              className="w-full h-full border-0"
              title="Customer Details"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={form.name || ""}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          type="email"
          value={form.email || ""}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Phone"
          value={form.phone || ""}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Address"
          value={form.address || ""}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Customer"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr 
                key={c.id} 
                id={`customer-${c.id}`}
                className={highlightedCustomerId === c.id ? "bg-yellow-100" : ""}
              >
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.phone}</td>
                <td className="p-2 border">{c.address || "N/A"}</td>
                <td className="p-2 border">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openCustomerDetail(c.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                  >
                    View
                  </button>
                  <Link 
                    href={`/admin/customer/${c.id}/edit`}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      <CustomerModal />
    </div>
  );
}

// Wrap the page content in Suspense for useSearchParams
export default function CustomerPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <CustomerPageContent />
    </Suspense>
  );
}
