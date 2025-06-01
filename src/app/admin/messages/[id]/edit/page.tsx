"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import MessageTemplateForm from '@/src/app/admin/messages/MessageTemplateForm';

export default function EditMessageTemplatePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/message-template/${id}`)
      .then(res => res.json())
      .then(data => {
        setTemplate(data.result?.data ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex bg-gray-100"><AdminSidebar /><main className="flex-1 flex flex-col items-center justify-center p-8"><div className="text-gray-500">Loading...</div></main></div>;
  }
  if (!template) {
    return <div className="min-h-screen flex bg-gray-100"><AdminSidebar /><main className="flex-1 flex flex-col items-center justify-center p-8"><div className="text-red-500">Template not found.</div></main></div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-6">Edit Message Template</h1>
          <MessageTemplateForm template={template} />
        </div>
      </main>
    </div>
  );
}
