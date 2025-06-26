"use client";
import { useEffect, useState } from "react";
import { Lead } from "./page";

interface LeadStatsSummaryProps {
  leads: Lead[];
  userRole: string | undefined;
  userId: string | undefined;
  leadTasks: { leadId: string; dueDate: string; status: string }[];
}

export default function LeadStatsSummary({ leads, userRole, userId, leadTasks }: LeadStatsSummaryProps) {
  const [userStats, setUserStats] = useState({
    totalLeads: 0,
    leadsOwned: 0,
    leadsAssigned: 0,
    tasksDueToday: 0,
    tasksDueThisWeek: 0,
    leadsByStage: {} as Record<string, number>,
  });

  useEffect(() => {
    // Only process stats if we have a userId
    if (!userId) return;

    // Helper function to check if a date is today
    const isToday = (dateString: string) => {
      const today = new Date();
      const date = new Date(dateString);
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    };

    // Helper function to check if a date is within this week
    const isThisWeek = (dateString: string) => {
      const today = new Date();
      const date = new Date(dateString);
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return date >= startOfWeek && date <= endOfWeek;
    };

    // Different logic based on user role
    if (userRole === "ADMIN") {
      // For admins, show stats for ALL leads
      const allLeadIds = new Set(leads.map(l => l.id));
      
      // Filter tasks for all leads
      const allTasks = leadTasks.filter(task => task.status !== 'completed');
      const tasksDueToday = allTasks.filter(task => isToday(task.dueDate));
      const tasksDueThisWeek = allTasks.filter(task => isThisWeek(task.dueDate));
      
      // Count leads by stage for all leads
      const stageCount: Record<string, number> = {};
      leads.forEach(lead => {
        const stageName = typeof lead.stage === "object" ? lead.stage?.name || 'Unknown' : lead.stage || 'Unknown';
        stageCount[stageName] = (stageCount[stageName] || 0) + 1;
      });

      // Count leads by ownership/assignment
      const leadsOwned = leads.filter(lead => lead.ownedById !== null);
      const leadsAssigned = leads.filter(lead => lead.assignedTo !== null);

      // Update admin stats
      setUserStats({
        totalLeads: leads.length,
        leadsOwned: leadsOwned.length,
        leadsAssigned: leadsAssigned.length,
        tasksDueToday: tasksDueToday.length,
        tasksDueThisWeek: tasksDueThisWeek.length,
        leadsByStage: stageCount,
      });
    } else {
      // For agents, only show stats for leads owned or assigned to them
      const leadsOwned = leads.filter(lead => lead.ownedById === userId);
      const leadsAssigned = leads.filter(lead => lead.assignedTo === userId);
      const userLeadIds = new Set([...leadsOwned.map(l => l.id), ...leadsAssigned.map(l => l.id)]);
      
      // Filter tasks related to the agent's leads
      const userTasks = leadTasks.filter(task => userLeadIds.has(task.leadId) && task.status !== 'completed');
      const tasksDueToday = userTasks.filter(task => isToday(task.dueDate));
      const tasksDueThisWeek = userTasks.filter(task => isThisWeek(task.dueDate));
      
      // Count leads by stage for agent's leads
      const stageCount: Record<string, number> = {};
      leads.forEach(lead => {
        if (lead.ownedById === userId || lead.assignedTo === userId) {
          const stageName = typeof lead.stage === "object" ? lead.stage?.name || 'Unknown' : lead.stage || 'Unknown';
          stageCount[stageName] = (stageCount[stageName] || 0) + 1;
        }
      });

      // Update agent stats
      setUserStats({
        totalLeads: userLeadIds.size,
        leadsOwned: leadsOwned.length,
        leadsAssigned: leadsAssigned.length,
        tasksDueToday: tasksDueToday.length,
        tasksDueThisWeek: tasksDueThisWeek.length,
        leadsByStage: stageCount,
      });
    }
  }, [leads, userId, userRole, leadTasks]);

  // If no user or not an agent, don't show stats
  if (!userId || (userRole !== "AGENT" && userRole !== "ADMIN")) {
    return null;
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Your Lead Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{userStats.totalLeads}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Leads</div>
          <div className="text-xs mt-1">
            <span className="mr-2">Owned: {userStats.leadsOwned}</span>
            <span>Assigned: {userStats.leadsAssigned}</span>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
          <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{userStats.tasksDueToday}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Tasks Due Today</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">{userStats.tasksDueThisWeek}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Tasks Due This Week</div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Leads by Stage</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(userStats.leadsByStage).map(([stage, count]) => (
            <div key={stage} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
              <span className="font-medium">{stage}:</span> {count}
            </div>
          ))}
          {Object.keys(userStats.leadsByStage).length === 0 && (
            <p className="text-sm text-gray-500">No leads assigned to stages</p>
          )}
        </div>
      </div>
    </div>
  );
}
