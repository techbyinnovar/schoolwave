"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Step 1 fields match signup form
const initialForm = {
  schoolName: "",
  address: "",
  numStudents: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

export default function BookDemoPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [demoDate, setDemoDate] = useState("");
  const [demoTime, setDemoTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: form.schoolName,
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail,
          address: form.address,
          numStudents: form.numStudents,
          demoDate,
          demoTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      setSuccess(true);
      setForm(initialForm);
      setDemoDate("");
      setDemoTime("");
      setTimeout(() => {
        setSuccess(false);
        const params = new URLSearchParams({
          day: demoDate,
          time: demoTime,
        });
        router.push(`/thank-you?${params.toString()}`);
      }, 1500);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#00164E] bg-[url('/sch_elementwhite.png')] bg-contain bg-center">
      <div className="relative bg-cover bg-center bg-no-repeat flex-1 flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-contain grad"></div>
        <div className="relative z-10 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8 w-full">
          <Image src="/schoolwave.png" alt="Schoolwave Logo" width={120} height={120} className="mb-8 rounded-full shadow-lg" />
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Book a Demo</h2>
            <div className="my-4 text-center">
              <Link href="/get_demo_code" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out">
                Watch our pre-recorded demo Now
              </Link>
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {success && <div className="text-green-600 mb-2">Demo booked successfully !!!</div>}
            {step === 1 && (
              <form onSubmit={handleStep1} className="flex flex-col gap-3">
                <input required name="schoolName" value={form.schoolName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Name" />
                <input required name="address" value={form.address} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Address" />
                <input required name="numStudents" value={form.numStudents} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Number of Students" type="number" min="1" />
                <input required name="contactName" value={form.contactName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Name" />
                <input required name="contactPhone" value={form.contactPhone} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Phone" />
                <input required name="contactEmail" value={form.contactEmail} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Email" type="email" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">Next</button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="font-semibold">Select Demo Day:</label>
                <input required type="date" value={demoDate} onChange={e => setDemoDate(e.target.value)} className="border px-2 py-1 rounded" min={new Date().toISOString().split('T')[0]} />
                <label className="font-semibold">Select Time:</label>
                <input required type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)} className="border px-2 py-1 rounded" />
                <div className="flex gap-2 mt-2">
                  <button type="button" className="border px-4 py-2 rounded" onClick={() => setStep(1)} disabled={loading}>Back</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" disabled={loading}>{loading ? "Booking..." : "Book Demo"}</button>
                </div>
              </form>
            )}
          </div>
          <Link href="/" className="mt-8 px-6 py-3 rounded-full bg-white text-[#0045f6] font-semibold shadow hover:bg-blue-100 transition">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
