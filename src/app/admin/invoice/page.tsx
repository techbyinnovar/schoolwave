"use client";
import React, { useEffect, useState } from "react";

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
  createdAt: string;
  updatedAt: string;
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Invoice>>({});
  const [loading, setLoading] = useState(false);
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
      setInvoices(data);
    } catch (err: any) {
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
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
        <input
          className="border p-2 rounded"
          placeholder="Status"
          value={form.status || ""}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          required
        />
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
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => window.location.href = `/admin/invoice/${inv.id}`}
              >
                <td className="p-2 border">{inv.customer?.name}</td>
                <td className="p-2 border">{inv.amount}</td>
                <td className="p-2 border">{inv.status}</td>
                <td className="p-2 border">{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td className="p-2 border">{new Date(inv.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
