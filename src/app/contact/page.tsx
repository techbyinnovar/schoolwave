"use client";

import ContactForm from "@/components/ContactForm";
import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00164E] bg-[url('/sch_elementwhite.png')] bg-contain bg-center pt-12">
      <Image src="/schoolwave.png" alt="Schoolwave Logo" width={100} height={100} className="mb-6 rounded-full shadow-lg" />
      <Link href="/" className="mb-8 self-start text-[#0045f6] hover:underline font-semibold">← Back to Home</Link>
      <div className="w-full max-w-lg p-8 bg-white bg-opacity-90 rounded-2xl shadow-lg flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-[#00164E]">Contact Us</h1>
        <ContactForm />
      </div>
    </div>
  );
}
