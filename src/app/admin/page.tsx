"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboard() {
  // Dashboard stats state
  const [stats, setStats] = useState({
    users: 0,
    contentAdmins: 0,
    agents: 0,
    lastCreated: "-",
  });

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        const users = data.result?.data ?? [];
        setStats({
          users: users.length,
          contentAdmins: users.filter((u: any) => u.role === "CONTENT_ADMIN").length,
          agents: users.filter((u: any) => u.role === "AGENT").length,
          lastCreated: users.length ? new Date(Math.max(...users.map((u: any) => new Date(u.createdAt).getTime()))).toLocaleString() : "-",
        });
      });
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">
    
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full ">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600">{stats.contentAdmins}</div>
              <div className="text-gray-600">Content Admins</div>
            </div>
            <div className="bg-white rounded shadow p-6 flex flex-col items-center">
              <div className="text-2xl font-bold text-purple-600">{stats.agents}</div>
              <div className="text-gray-600">Agents</div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6 mt-4 flex flex-col items-center">
            <div className="text-gray-600">Last User Created</div>
            <div className="text-lg font-medium mt-2">{stats.lastCreated}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
