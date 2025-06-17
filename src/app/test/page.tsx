"use client";
import { useState } from "react";

export default function TestPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test Email from SMTP");
  const [body, setBody] = useState("This is a test email sent via SMTP.");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/test-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text: body }),
      });
      const data = await res.json();
      if (data.success) {
        setResult("Email sent successfully!");
      } else {
        setResult(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">SMTP Email Test</h1>
      <form onSubmit={handleSend} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-semibold mb-1">To</label>
          <input type="email" className="border p-2 rounded w-full" value={to} onChange={e => setTo(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Subject</label>
          <input type="text" className="border p-2 rounded w-full" value={subject} onChange={e => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Body</label>
          <textarea className="border p-2 rounded w-full" rows={4} value={body} onChange={e => setBody(e.target.value)} required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>{loading ? "Sending..." : "Send Test Email"}</button>
      </form>
      {result && <div className="mt-4 p-3 rounded bg-gray-100 text-center">{result}</div>}
    </div>
  );
}

