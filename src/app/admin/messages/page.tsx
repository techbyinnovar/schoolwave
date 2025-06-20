"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MessagesAdminPage() {
  const [activeTab, setActiveTab] = useState<'messages' | 'templates'>('messages');
  const [templates, setTemplates] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [errorTemplates, setErrorTemplates] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'templates') {
      setIsLoadingTemplates(true);
      setErrorTemplates(null);
      fetch("/api/message-template")
        .then(res => res.json())
        .then(data => {
          setTemplates(data.result?.data ?? []);
          setIsLoadingTemplates(false);
        })
        .catch(() => {
          setErrorTemplates('Failed to load templates');
          setIsLoadingTemplates(false);
        });
    } else if (activeTab === 'messages') {
      setIsLoadingMessages(true);
      setErrorMessages(null);
      fetch("/api/messages")
        .then(res => res.json())
        .then(data => {
          setMessages(data.result?.data ?? []);
          setIsLoadingMessages(false);
        })
        .catch(() => {
          setErrorMessages('Failed to load messages');
          setIsLoadingMessages(false);
        });
    }
  }, [activeTab]);

  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div className="min-h-screen flex bg-gray-100">

      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full">
          <div className="p-6 max-w-[90%] mx-auto">
            <div className="flex gap-4 mb-8 border-b">
              <button
                className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'messages' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-gray-500'}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
              {role !== 'AGENT' && (
                <button
                  className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'templates' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-gray-500'}`}
                  onClick={() => setActiveTab('templates')}
                >
                  Message Template
                </button>
              )}
            </div>

            {activeTab === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-blue-700">Messages</h1>
                  <Link href="/admin/messages/send" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send Message</Link>
                </div>
                {isLoadingMessages ? (
                  <div className="text-gray-500">Loading...</div>
                ) : errorMessages ? (
                  <div className="text-red-500">{errorMessages}</div>
                ) : messages.length === 0 ? (
                  <div className="text-gray-500">No messages yet.</div>
                ) : (
                  <ul>
                    {messages.map((msg) => (
                      <li key={msg.id} className="border p-3 mb-2 rounded flex justify-between items-center">
                        <span>{msg.subject || msg.content || msg.text || msg.id}</span>
                        {/* Add more details/actions as needed */}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-blue-700">Message Templates</h1>
                  <Link href="/admin/messages/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">New Template</Link>
                </div>
                {isLoadingTemplates ? (
                  <div className="text-gray-500">Loading...</div>
                ) : errorTemplates ? (
                  <div className="text-red-500">{errorTemplates}</div>
                ) : templates.length === 0 ? (
                  <div className="text-gray-500">No templates yet.</div>
                ) : (
                  <ul>
                    {templates.map((tpl) => (
                      <li key={tpl.id} className="border p-3 mb-2 rounded flex justify-between items-center">
                        <span>{tpl.name}</span>
                        <Link href={`/admin/messages/${tpl.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
