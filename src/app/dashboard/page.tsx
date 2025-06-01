"use client";
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    switch (session.user.role) {
      case "ADMIN":
        router.replace("/admin");
        break;
      case "CONTENT_ADMIN":
        router.replace("/cms");
        break;
      case "AGENT":
        router.replace("/crm");
        break;
      default:
        router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to SchoolWave</h1>
        <p>Redirecting you to the appropriate dashboard...</p>
        {session?.user?.role && (
          <p className="mt-2 text-gray-600">
            Detected role: {session.user.role}
          </p>
        )}
      </div>
    </div>
  );
}
