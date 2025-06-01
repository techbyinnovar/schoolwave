"use client";
import React, { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-8 max-w-3xl mx-auto">
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
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.email}</td>
                <td className="p-2 border">{c.phone}</td>
                <td className="p-2 border">{c.address}</td>
                <td className="p-2 border">{new Date(c.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
