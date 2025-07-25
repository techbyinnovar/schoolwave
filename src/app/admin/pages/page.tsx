"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { toast } from "sonner";

type Page = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  User: {
    name: string | null;
    email: string;
  };
};

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pages");
      
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  // Delete page
  const deletePage = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/pages/${slug}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete page");
      }
      
      toast.success("Page deleted successfully");
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete page");
    }
  };

  // Toggle publish status
  const togglePublish = async (page: Page) => {
    try {
      const response = await fetch(`/api/pages/${page.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          published: !page.published,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update page");
      }
      
      toast.success(`Page ${!page.published ? "published" : "unpublished"} successfully`);
      fetchPages(); // Refresh the list
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update page status");
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Pages</h1>
        <Link 
          href="/admin/pages/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Page
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading pages...</p>
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No pages found. Create your first page!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Slug</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Last Updated</th>
                <th className="py-3 px-4 text-left">Created By</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{page.title}</td>
                  <td className="py-3 px-4">{page.slug}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        page.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {page.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{page.User.name || page.User.email}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => router.push(`/admin/pages/edit/${page.slug}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => togglePublish(page)}
                        className={`${
                          page.published ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"
                        }`}
                        title={page.published ? "Unpublish" : "Publish"}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deletePage(page.slug)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
