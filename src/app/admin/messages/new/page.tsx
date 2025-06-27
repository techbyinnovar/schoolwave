// Mark page as client-only with 'use client' directive
"use client";
import React from "react";
import dynamic from "next/dynamic";

// Using absolute path and explicit chunk name for better production compatibility
const NewMessageTemplatePageClient = dynamic(
  () => import(/* webpackChunkName: "message-template-client" */ "@/app/admin/messages/new/NewMessageTemplatePageClient"),
  { ssr: false, loading: () => <div className="p-8">Loading message template editor...</div> }
);

export default function Page() {
  return <NewMessageTemplatePageClient />;
}
