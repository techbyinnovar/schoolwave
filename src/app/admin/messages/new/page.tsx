// Mark page as client-only with 'use client' directive
"use client";
import React from "react";
import dynamic from "next/dynamic";

const NewMessageTemplatePageClient = dynamic(
  () => import("./NewMessageTemplatePageClient"),
  { ssr: false }
);

export default function Page() {
  return <NewMessageTemplatePageClient />;
}
