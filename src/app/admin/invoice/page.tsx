"use client";
import React, { useEffect, useState } from "react";

// Function to get color class based on status
function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid': return 'bg-green-100 text-green-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100';
  }
}

interface Customer {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  customerId: string;
  customer: Customer;
  Customer: Customer; // Support for capitalized relation field
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Invoice>>({});
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<{[key: string]: boolean}>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invoice");
      const data = await res.json();
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        console.error('API response is not an array:', data);
        setInvoices([]);
        setError("Invalid invoice data format received");
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError("Failed to fetch invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }
  
  // Handle invoice status change
  async function handleStatusChange(invoiceId: string, newStatus: string) {
    if (statusLoading[invoiceId]) return; // Prevent multiple simultaneous updates
    
    setStatusLoading(prev => ({ ...prev, [invoiceId]: true }));
    setError(null);
    
    try {
      const res = await fetch(`/api/invoice/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update invoice status');
      }
      
      // Update the invoice in the local state
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      ));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setStatusLoading(prev => ({ ...prev, [invoiceId]: false }));
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customer");
      const data = await res.json();
      setCustomers(data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      setForm({});
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="border p-2 rounded"
          value={form.customerId || ""}
          onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
          required
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          className="border p-2 rounded"
          placeholder="Amount"
          type="number"
          value={form.amount || ""}
          onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
          required
        />
        <select
          className="border p-2 rounded"
          value={form.status || "draft"}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          required
        >
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="canceled">Canceled</option>
        </select>
        <input
          className="border p-2 rounded"
          placeholder="Due Date"
          type="date"
          value={form.dueDate ? form.dueDate.slice(0,10) : ""}
          onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
          required
        />
        <button
          type="submit"
          className="col-span-1 md:col-span-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Invoice"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Due Date</th>
              <th className="p-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(invoices) && invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-gray-100"
              >
                <td className="p-2 border cursor-pointer" onClick={() => window.location.href = `/admin/invoice/${inv.id}`}>
                  {inv.customer?.name || inv.Customer?.name}
                </td>
                <td className="p-2 border cursor-pointer" onClick={() => window.location.href = `/admin/invoice/${inv.id}`}>
                  {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(inv.amount)}
                </td>
                <td className="p-2 border">
                  <select
                    className={`border rounded p-1 ${getStatusColor(inv.status)}`}
                    value={inv.status}
                    onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                    disabled={statusLoading[inv.id]}
                    onClick={(e) => e.stopPropagation()} // Prevent row click when selecting
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  {statusLoading[inv.id] && (
                    <span className="ml-2 text-xs">Updating...</span>
                  )}
                </td>
                <td className="p-2 border cursor-pointer" onClick={() => window.location.href = `/admin/invoice/${inv.id}`}>
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className="p-2 border cursor-pointer" onClick={() => window.location.href = `/admin/invoice/${inv.id}`}>
                  {new Date(inv.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
