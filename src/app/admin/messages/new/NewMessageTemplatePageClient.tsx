"use client";
import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import MessageTemplateForm from "../MessageTemplateForm";

export default function NewMessageTemplatePageClient() {
  return (
    <div className="min-h-screen flex bg-gray-100">
    
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-3xl">
          <h1 className="text-2xl font-bold mb-6 text-blue-700">New Message Template</h1>
          <MessageTemplateForm onClose={() => { window.location.href = '/admin/messages'; }} />
        </div>
      </main>
    </div>
  );
}
