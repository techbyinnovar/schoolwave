"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminSidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col p-6 border-r border-gray-200 min-h-screen">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-blue-700">Admin Panel</h2>
        <p className="text-xs text-gray-400 mt-1">SchoolWave CRM</p>
      </div>
      <nav className="flex flex-col gap-4 text-base">
        {role === "AGENT" ? (
          <>
            <Link href="/admin/crm" className="text-blue-700 font-semibold hover:underline">CRM</Link>
            <Link href="/agent/assets" className="text-gray-800 hover:text-blue-700 font-semibold">Assets</Link>
            <Link href="/tasks" className="text-gray-800 hover:text-blue-700 font-semibold">Tasks</Link>
            <Link href="/admin/agent/demo" className="text-gray-800 hover:text-blue-700 font-semibold">View Demo</Link>
          </>
        ) : role === "CONTENT_ADMIN" ? (
          <>
            <Link href="/admin/blogs" className="text-gray-800 hover:text-blue-700">Blog</Link>
            <Link href="/admin/webinars" className="text-gray-800 hover:text-blue-700">Webinars</Link>
            <Link href="/tasks" className="text-gray-800 hover:text-blue-700 font-semibold">Tasks</Link>
            <Link href="/admin/demos" className="text-gray-800 hover:text-blue-700 font-semibold">Demo Management</Link>
            {/* No assets for content admin */}
            <Link href="/admin/agent/demo" className="text-gray-800 hover:text-blue-700 font-semibold">View Demo</Link>
          </>
        ) : (
          <>
            <Link href="/admin" className="text-blue-700 font-semibold hover:underline">Dashboard</Link>
            <Link href="/admin/users" className="text-gray-800 hover:text-blue-700">Users</Link>
            <Link href="/admin/crm" className="text-gray-800 hover:text-blue-700">CRM</Link>
            <Link href="/admin/assets" className="text-gray-800 hover:text-blue-700 font-semibold">Assets</Link>
            <Link href="/admin/blogs" className="text-gray-800 hover:text-blue-700">Blog</Link>
            <Link href="/admin/webinars" className="text-gray-800 hover:text-blue-700">Webinars</Link>
            <Link href="/tasks" className="text-gray-800 hover:text-blue-700 font-semibold">Tasks</Link>
            <Link href="/admin/registrants" className="text-gray-800 hover:text-blue-700">Registrants</Link>
            <Link href="/admin/customer" className="text-gray-800 hover:text-blue-700">Customers</Link>
            <Link href="/admin/invoice" className="text-gray-800 hover:text-blue-700">Invoices</Link>
            <Link href="/admin/subscription" className="text-gray-800 hover:text-blue-700">Subscriptions</Link>
            <Link href="/admin/requests" className="text-gray-800 hover:text-blue-700 font-semibold">Requests</Link>
            <Link href="/admin/forms" className="text-gray-800 hover:text-blue-700 font-semibold">Forms</Link>
            <Link href="/admin/demos" className="text-gray-800 hover:text-blue-700 font-semibold">Demo Management</Link>
            <Link href="/admin/agent/demo" className="text-gray-800 hover:text-blue-700 font-semibold">View Demo</Link>
            <Link href="/admin/pages" className="text-gray-800 hover:text-blue-700">Pages</Link>
            <Link href="/admin/settings" className="text-gray-800 hover:text-blue-700">Settings</Link>
            <Link href="/admin/messages" className="text-gray-800 hover:text-blue-700">Messages</Link>
          </>
        )}
      </nav>
      <div className="mt-auto pt-10 text-xs text-gray-400">&copy; {new Date().getFullYear()} SchoolWave</div>
    </aside>
  );
}
