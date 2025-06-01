"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import PocketBase from "pocketbase";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const pb = new PocketBase("https://rough-art.pockethost.io");

interface IPost {
  id: string;
  title: string;
  content: string;
  created: number;
  image: string;
  category: string;
  keyphrase: string;
  tag: string;
  slug: string;
  updated: string;
}

export default function Post() {
  const params = useParams();
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const result = await pb.collection("posts").getOne(params.id as string);
        setPost(result as unknown as IPost);

        if (result.content) {
          const parsedContent = marked.parse(result.content);
          setHtmlContent(DOMPurify.sanitize(parsedContent));
        } else {
          console.log('cooottoto', result);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return <div className="bg-white h-[720px]">Loading...</div>;
  }

  return (
    <div className="bg-white">
      <div className="bg-[#00164E] mb-10 md:mb-20">
        <Header />
      </div>
      <div className="px-4 md:px-24 flex items-center justify-center pb-16 md:pb-32">
        {post ? (
          <div className="w-full md:w-[70%] flex flex-col justify-center items-start">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 md:mb-10 mt-1">{post.title}</h1>
            {post.image && (
              <img
                src={`https://rough-art.pockethost.io/api/files/o3dofvehqdj8cpp/${post.id}/${post.image}`}
                alt={post.title}
                className="rounded-3xl mb-4 md:mb-6 w-full object-cover"
              />
            )}
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-8 w-full">
              <div className="text-gray-500 text-sm md:text-md">
                {/* <Date dateString={new Date(post.created * 1000).toISOString()} /> */}
              </div>
              <span className="text-[#0045f6] font-normal text-sm md:text-md">
                #{post.category}
              </span>
            </div>
            <div className="mt-6 md:mt-10 text-sm md:text-base">
              {htmlContent ? parse(htmlContent) : <p>No content available</p>}
            </div>
          </div>
        ) : (
          "loading..."
        )}
      </div>

      <hr />

      <Footer />
    </div>
  );
}
