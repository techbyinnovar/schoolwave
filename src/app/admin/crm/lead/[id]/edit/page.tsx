"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// AdminSidebar is already provided by the layout

interface LeadFormData {
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  stageId: string;
  ownedById: string;
  assignedTo: string | null;
  demoCode?: string | null;
}

export default function EditLeadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agents, setAgents] = useState<{ id: string; name?: string | null; email: string }[]>([]);
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<LeadFormData>({
    schoolName: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    stageId: "",
    ownedById: "",
    assignedTo: null,
    demoCode: null,
  });

  // Fetch lead data, agents and stages
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch lead data
        const leadRes = await fetch(`/api/lead/${params.id}`);
        if (!leadRes.ok) {
          throw new Error(`Failed to fetch lead: ${leadRes.status}`);
        }
        const leadData = await leadRes.json().then(data => data.result.data);
        
        // Fetch agents
        const agentsRes = await fetch("/api/agents");
        if (!agentsRes.ok) {
          throw new Error(`Failed to fetch agents: ${agentsRes.status}`);
        }
        const agentsData = await agentsRes.json();
        
        // Fetch stages
        const stagesRes = await fetch("/api/stages");
        if (!stagesRes.ok) {
          throw new Error(`Failed to fetch stages: ${stagesRes.status}`);
        }
        const stagesData = await stagesRes.json();
        
        // Update state
        setAgents(agentsData);
        setStages(stagesData);
        
        // Populate form data
        setFormData({
          schoolName: leadData.schoolName || "",
          name: leadData.name || "",
          phone: leadData.phone || "",
          email: leadData.email || "",
          address: leadData.address || "",
          stageId: leadData.stage?.id || "",
          ownedById: leadData.ownedBy?.id || "",
          assignedTo: leadData.agent?.id || null,
          demoCode: leadData.demoCode || null,
        });
      } catch (err: any) {
        console.error("Error loading lead data:", err);
        setError(err.message || "Failed to load lead data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [params.id]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Normalize phone number for WhatsApp compatibility
      let phoneToSubmit = formData.phone;
      if (phoneToSubmit) {
        // Clean the number first (remove spaces, dashes, etc.)
        let cleaned = phoneToSubmit.replace(/[^0-9+]/g, "");
        
        // Format according to Nigerian standards
        if (cleaned.startsWith("0")) {
          // Remove the leading 0 and add +234
          phoneToSubmit = "+234" + cleaned.substring(1);
        } else if (cleaned.startsWith("234") && !cleaned.startsWith("+234")) {
          // Add + to numbers starting with 234
          phoneToSubmit = "+" + cleaned;
        } else if (cleaned.startsWith("+234")) {
          // Already in the correct format
          phoneToSubmit = cleaned;
        } else {
          // If none of the above, ensure + is present for international format
          phoneToSubmit = cleaned.startsWith("+") ? cleaned : "+" + cleaned;
        }
      }
      
      // Prepare payload with normalized phone
      const payload = {
        ...formData,
        phone: phoneToSubmit
      };
      
      // Submit update
      const response = await fetch(`/api/lead/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update lead: ${response.status}`);
      }
      
      // Success!
      setSuccess("Lead updated successfully!");
      
      // Redirect back to lead list page with lead highlighted after brief delay
      setTimeout(() => {
        router.push(`/admin/crm?lead=${params.id}`);
      }, 1500);
      
    } catch (err: any) {
      console.error("Error updating lead:", err);
      setError(err.message || "Failed to update lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Lead</h1>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-800"
              onClick={() => router.back()}
            >
              ← Back
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                  {success}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: +234XXXXXXXXXX (will be automatically formatted)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    name="stageId"
                    value={formData.stageId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Stage</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner
                  </label>
                  <select
                    name="ownedById"
                    value={formData.ownedById}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not Assigned</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name || agent.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Agent
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Not Assigned</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name || agent.email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Demo Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="demoCode"
                    value={formData.demoCode || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
