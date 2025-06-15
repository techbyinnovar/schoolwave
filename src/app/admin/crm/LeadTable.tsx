"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Lead } from "./page";

interface LeadTableProps {
  leads: Lead[];
  agents: { id: string; name?: string; email: string }[];
  stages: { id: string; name: string }[];
  userRole: string | undefined;
}

export default function LeadTable({ leads, agents, stages, userRole }: LeadTableProps) {
  const router = useRouter();
  // Filter state
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("");
  const [assignedFilter, setAssignedFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("");

  // Filtering logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search.trim() === "" ||
        [lead.schoolName, lead.name, lead.phone, lead.email, lead.address]
          .filter(Boolean)
          .some((val) => val && val.toLowerCase().includes(search.toLowerCase()));
      const matchesOwner =
        !ownerFilter || lead.ownedById === ownerFilter;
      const matchesAssigned =
        !assignedFilter || lead.assignedTo === assignedFilter;
      const matchesStage =
        !stageFilter || (typeof lead.stage === "object" ? lead.stage?.name === stageFilter : lead.stage === stageFilter);
      return matchesSearch && matchesOwner && matchesAssigned && matchesStage;
    });
  }, [leads, search, ownerFilter, assignedFilter, stageFilter]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <input
          type="text"
          placeholder="Search leads..."
          className="border rounded px-3 py-2 flex-1 min-w-[180px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
        >
          <option value="">All Owners</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={assignedFilter}
          onChange={e => setAssignedFilter(e.target.value)}
        >
          <option value="">All Assigned</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name ? `${agent.name} (${agent.email})` : agent.email}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          {stages.map(stage => (
            <option key={stage.id} value={stage.name}>{stage.name}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2"
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          {stages.map(stage => (
            <option key={stage.id} value={stage.name}>{stage.name}</option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">School Name</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Stage</th>
              <th className="px-4 py-2 text-left">Owner</th>
              <th className="px-4 py-2 text-left">Assigned To</th>
              <th className="px-4 py-2 text-left">Demo Code</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">No leads found.</td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors cursor-pointer group"
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    router.push(`/admin/crm/lead/${lead.id}`);
                  }}
                >
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.schoolName}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.name}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.phone}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.email}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.address}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{typeof lead.stage === "object" ? lead.stage?.name : lead.stage}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.ownedBy ? (lead.ownedBy.name || lead.ownedBy.email) : <span className="italic text-gray-400">Unassigned</span>}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.agent ? (lead.agent.name || lead.agent.email) : <span className="italic text-gray-400">Unassigned</span>}</td>
                  <td className="border px-4 py-2 group-hover:font-semibold">{lead.demoCode ?? <span className="italic text-gray-400">N/A</span>}</td>
                  <td className="border px-4 py-2">
                    {/* You can add Edit/Delete/View buttons here */}
                    <button className="text-blue-600 hover:underline mr-2">Edit</button>
                    {userRole !== "AGENT" && (
                      <button className="text-red-600 hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
