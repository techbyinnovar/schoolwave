import { notFound } from "next/navigation";
import { db as prisma } from "@/lib/db";
import { Metadata, ResolvingMetadata } from "next";

// Component to safely render HTML content with Tailwind classes
const HtmlContent = ({ content }: { content: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  
  // Fetch the page
  const page = await prisma.page.findFirst({
    where: {
      slug,
      published: true,
    },
  });
  
  // If page doesn't exist or isn't published, return default metadata
  if (!page) {
    return {
      title: "Page Not Found",
    };
  }
  
  return {
    title: page.title,
    description: page.description || `${page.title} - SchoolWave`,
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Fetch the page
  const page = await prisma.page.findFirst({
    where: {
      slug,
      published: true,
    },
  });
  
  // If page doesn't exist or isn't published, show 404
  if (!page) {
    notFound();
  }
  
  return (
    <HtmlContent content={page.content} />
  );
}
