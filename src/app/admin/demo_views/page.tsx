"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// DemoLead type matches Lead model fields relevant to demo
interface DemoLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  schoolName: string;
  numberOfStudents?: string;
  howHeard?: string;
  demoCode?: string;
  demoLog?: any;
  address?: string;
  createdAt: string;
}

export default function DemoViewsPage() {
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: Replace with real API call
    fetch("/api/demo_leads")
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load demo leads");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Demo Views (Leads who watched demo)</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="bg-white rounded-lg shadow p-6">
        {leads.length === 0 && !loading ? (
          <div>No demo leads found.</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">School</th>
                <th className="p-2 text-left"># Students</th>
                <th className="p-2 text-left">How Heard</th>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">{lead.email}</td>
                  <td className="p-2">{lead.phone}</td>
                  <td className="p-2">{lead.schoolName}</td>
                  <td className="p-2">{lead.numberOfStudents || '-'}</td>
                  <td className="p-2">{lead.howHeard || '-'}</td>
                  <td className="p-2">{lead.address || '-'}</td>
                  <td className="p-2">{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-center">
                    <Link href={`/admin/demo_views/${lead.id}`} className="text-blue-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
