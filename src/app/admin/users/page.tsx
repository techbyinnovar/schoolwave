"use client";
import UserTable from "./UserTable";

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">User Management</h1>
          <UserTable />
        </div>
      </main>
    </div>
  );
}
