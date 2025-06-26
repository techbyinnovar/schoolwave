"use client";
import React from "react";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [embed, setEmbed] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      setEmbed(sp.get('embed') === '1');
    }
  }, []);

  if (embed) {
    return <main className="w-full bg-gray-50 p-6">{children}</main>;
  }
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
