"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

type PageData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string | null;
  published: boolean;
  publishedAt: string | null;
};

export default function EditPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  
  const [title, setTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pages/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Page not found");
          }
          throw new Error("Failed to fetch page");
        }
        
        const pageData: PageData = await response.json();
        
        setTitle(pageData.title);
        setNewSlug(pageData.slug);
        setContent(pageData.content);
        setDescription(pageData.description || "");
        setPublished(pageData.published);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching page:", error);
        setError(error.message || "Failed to load page");
        toast.error(error.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPage();
  }, [slug]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug if slug hasn't been manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto-update slug if it's the same as the original slug
    if (newSlug === slug) {
      setNewSlug(generateSlug(newTitle));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !newSlug || !content) {
      toast.error("Title, slug, and content are required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/pages/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          newSlug: newSlug !== slug ? newSlug : undefined,
          content,
          description,
          published,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update page");
      }
      
      toast.success("Page updated successfully");
      
      // If slug was changed, redirect to the new edit page
      if (newSlug !== slug) {
        router.push(`/admin/pages/edit/${newSlug}`);
      } else {
        // Refresh the page data
        router.refresh();
      }
    } catch (error: any) {
      console.error("Error updating page:", error);
      toast.error(error.message || "Failed to update page");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
      [{ color: [] }, { background: [] }],
      ["code-block"],
    ],
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading page...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link href="/admin/pages" className="text-red-600 hover:text-red-800 mt-4 inline-block">
            Return to Pages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/pages" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pages
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newSlug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="newSlug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL: /p/{newSlug}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can use HTML and Tailwind CSS classes in the content.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
              Published
            </label>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link 
            href={`/p/${slug}`} 
            target="_blank"
            className="text-blue-600 hover:text-blue-800"
          >
            View current page
          </Link>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Update Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
