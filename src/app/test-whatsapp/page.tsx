"use client";
import { useState } from "react";

export default function TestWhatsAppPage() {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult("Message sent successfully!");
      } else {
        setError(data.error || "Failed to send message");
      console.error('[TestWhatsApp UI ERROR]', data.error || 'Failed to send message', { to, message, time: new Date().toISOString() });
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      console.error('[TestWhatsApp UI ERROR]', err, { to, message, time: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-xl p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Test WhatsApp Message</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">WhatsApp Number</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. +2348012345678"
            value={to}
            onChange={e => setTo(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
      {result && <div className="mt-4 text-green-600">{result}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
}
