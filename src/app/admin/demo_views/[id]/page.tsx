"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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

export default function DemoLeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<DemoLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    // TODO: Replace with real API call
    fetch(`/api/demo_leads/${id}`)
      .then(res => res.json())
      .then(data => {
        setLead(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load lead details");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!lead) return <div className="p-10">Lead not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-xl font-bold mb-4">Demo Lead Details</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div><span className="font-semibold">Name:</span> {lead.name}</div>
        <div><span className="font-semibold">Email:</span> {lead.email}</div>
        <div><span className="font-semibold">Phone:</span> {lead.phone}</div>
        <div><span className="font-semibold">School:</span> {lead.schoolName}</div>
        {lead.numberOfStudents && <div><span className="font-semibold">Number of Students:</span> {lead.numberOfStudents}</div>}
        {lead.howHeard && <div><span className="font-semibold">How They Heard:</span> {lead.howHeard}</div>}
        {lead.address && <div><span className="font-semibold">Address:</span> {lead.address}</div>}
        {lead.demoCode && <div><span className="font-semibold">Demo Code:</span> {lead.demoCode}</div>}
        {lead.demoLog && <div><span className="font-semibold">Demo Log:</span> <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(lead.demoLog, null, 2)}</pre></div>}
        <div><span className="font-semibold">Created At:</span> {new Date(lead.createdAt).toLocaleString()}</div>
      </div>
      <div className="mt-6 text-center">
        <Link href="/admin/demo_views" className="text-blue-600 hover:underline">Back to Demo Views</Link>
      </div>
    </div>
  );
}
