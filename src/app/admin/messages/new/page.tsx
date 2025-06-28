// Mark page as client-only with 'use client' directive
"use client";
import React, { useEffect, useState } from "react";
import NewMessageTemplatePageClient from "./NewMessageTemplatePageClient";

// Simple client-only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : <div className="p-8">Loading message template editor...</div>;
}

export default function Page() {
  return (
    <ClientOnly>
      <NewMessageTemplatePageClient />
    </ClientOnly>
  );
}
