"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialForm = {
  email: "",
  phone: "",
};

export default function BookACallPage() {
  const [form, setForm] = useState(initialForm);
  const [callDate, setCallDate] = useState("");
  const [callTime, setCallTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    // TODO: Replace with real API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm(initialForm);
      setCallDate("");
      setCallTime("");
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Book a Call</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="callDate" className="block text-sm font-medium text-gray-700">Preferred Day</label>
          <input
            type="date"
            name="callDate"
            id="callDate"
            required
            value={callDate}
            onChange={e => setCallDate(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="callTime" className="block text-sm font-medium text-gray-700">Preferred Time</label>
          <input
            type="time"
            name="callTime"
            id="callTime"
            required
            value={callTime}
            onChange={e => setCallTime(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Call booked successfully! We'll contact you soon.</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Booking..." : "Book Call"}
        </button>
      </form>
      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    </div>
  );
}
