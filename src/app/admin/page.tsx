"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AdminSidebar from '@/components/AdminSidebar';

// Define type for activity items
type ActivityItem = {
  id: string;
  type: string;
  description: string;
  leadId?: string;
  date: string;
  disposition?: string;
};

export default function AdminDashboard() {
  // Dashboard stats state
  const [stats, setStats] = useState({
    users: 0,
    contentAdmins: 0,
    agents: 0,
    lastCreated: "-",
    // New system-wide stats
    leads: {
      total: 0,
      byStage: {},
      newThisWeek: 0,
      newThisMonth: 0
    },
    tasks: {
      total: 0,
      completed: 0,
      dueToday: 0,
      dueThisWeek: 0,
      overdue: 0
    },
    messages: {
      templates: 0,
      sent: 0
    },
    registrants: {
      total: 0,
      active: 0
    },
    revenue: {
      monthly: 0,
      annual: 0,
      lifetime: 0
    },
    recentActivity: [] as ActivityItem[]
  });

  // Fetch all system stats
  useEffect(() => {
    // Fetch users data
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        const users = data.result?.data ?? [];
        
        setStats(prevStats => ({
          ...prevStats,
          users: users.length,
          contentAdmins: users.filter((u: any) => u.role === "CONTENT_ADMIN").length,
          agents: users.filter((u: any) => u.role === "AGENT").length,
          lastCreated: users.length ? new Date(Math.max(...users.map((u: any) => new Date(u.createdAt).getTime()))).toLocaleString() : "-",
        }));
      });
    
    // Fetch leads data
    fetch("/api/lead")
      .then(res => res.json())
      .then(data => {
        const leads = data.result?.data ?? [];
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Group leads by stage
        const byStage: Record<string, number> = {};
        leads.forEach((lead: any) => {
          const stageName = typeof lead.stage === 'object' ? lead.stage?.name : lead.stage;
          if (stageName) {
            byStage[stageName] = (byStage[stageName] || 0) + 1;
          }
        });

        setStats(prevStats => ({
          ...prevStats,
          leads: {
            ...prevStats.leads,
            total: leads.length,
            byStage,
            newThisWeek: leads.filter((lead: any) => new Date(lead.createdAt) >= startOfWeek).length,
            newThisMonth: leads.filter((lead: any) => new Date(lead.createdAt) >= startOfMonth).length
          }
        }));
      });
      
    // Fetch tasks data
    fetch("/api/task")
      .then(res => res.json())
      .then(data => {
        const tasks = data.result?.data ?? [];
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        
        setStats(prevStats => ({
          ...prevStats,
          tasks: {
            ...prevStats.tasks,
            total: tasks.length,
            completed: tasks.filter((t: any) => t.status === 'completed').length,
            dueToday: tasks.filter((t: any) => {
              const dueDate = new Date(t.dueDate);
              return (
                t.status !== 'completed' && 
                dueDate.getDate() === today.getDate() &&
                dueDate.getMonth() === today.getMonth() &&
                dueDate.getFullYear() === today.getFullYear()
              );
            }).length,
            dueThisWeek: tasks.filter((t: any) => {
              if (t.status === 'completed') return false;
              const dueDate = new Date(t.dueDate);
              return dueDate >= today && dueDate <= endOfWeek;
            }).length,
            overdue: tasks.filter((t: any) => {
              if (t.status === 'completed') return false;
              const dueDate = new Date(t.dueDate);
              return dueDate < today;
            }).length
          }
        }));
      });
      
    // Fetch message templates
    fetch("/api/message-template")
      .then(res => res.json())
      .then(data => {
        const templates = data.result?.data ?? [];
        
        setStats(prevStats => ({
          ...prevStats,
          messages: {
            ...prevStats.messages,
            templates: templates.length,
          }
        }));
      });
      
    // Fetch registrants if endpoint available
    fetch("/api/registrant")
      .catch(() => ({ json: () => Promise.resolve({ result: { data: [] } }) }))
      .then(res => res.json())
      .then(data => {
        const registrants = data.result?.data ?? [];
        
        setStats(prevStats => ({
          ...prevStats,
          registrants: {
            ...prevStats.registrants,
            total: registrants.length,
            active: registrants.filter((r: any) => r.status === 'active').length
          }
        }));
      });
      
    // Fetch recent activity or system events
    fetch("/api/lead-history?limit=5")
      .then(res => res.json())
      .then(data => {
        const activities = data.result?.data ?? [];
        
        setStats(prevStats => ({
          ...prevStats,
          recentActivity: activities.map((activity: any): ActivityItem => ({
            id: activity.id,
            type: 'lead-activity',
            description: activity.notes || 'Lead activity',
            leadId: activity.leadId,
            date: activity.createdAt,
            disposition: activity.disposition
          }))
        }));
      });
  }, [/* formatDate is stable and doesn't depend on any changing state */]);

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 p-8">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">Admin Dashboard</h1>
          
          {/* User Stats Section */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">System Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-blue-600">{stats.users}</div>
                <div className="text-gray-600 mt-2">Total Users</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-green-600">{stats.contentAdmins}</div>
                <div className="text-gray-600 mt-2">Content Admins</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-purple-600">{stats.agents}</div>
                <div className="text-gray-600 mt-2">Agents</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition-all">
                <div className="text-gray-600 mb-1">Last User Created</div>
                <div className="text-lg font-medium">{stats.lastCreated}</div>
              </div>
            </div>
          </section>
          
          {/* Lead Management Stats */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Lead Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-blue-700">{stats.leads.total}</div>
                <div className="text-gray-600 mt-2">Total Leads</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-green-600">{stats.leads.newThisWeek}</div>
                <div className="text-gray-600 mt-2">New This Week</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-indigo-500">{stats.leads.newThisMonth}</div>
                <div className="text-gray-600 mt-2">New This Month</div>
              </div>
            </div>
            
            {/* Lead Stages Breakdown */}
            <div className="mt-4 bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
              <h3 className="text-lg font-semibold mb-4">Leads by Stage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.leads.byStage).map(([stage, count]) => (
                  <div key={stage} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">{stage}</div>
                    <div className="text-xl font-bold text-blue-600">{String(count)}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Task Management Stats */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Task Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-blue-600">{stats.tasks.total}</div>
                <div className="text-gray-600 mt-2">Total Tasks</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-green-600">{stats.tasks.completed}</div>
                <div className="text-gray-600 mt-2">Completed</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-yellow-500">{stats.tasks.dueToday}</div>
                <div className="text-gray-600 mt-2">Due Today</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-amber-500">{stats.tasks.dueThisWeek}</div>
                <div className="text-gray-600 mt-2">Due This Week</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-red-500">{stats.tasks.overdue}</div>
                <div className="text-gray-600 mt-2">Overdue</div>
              </div>
            </div>
          </section>
          
          {/* Message & Communication Stats */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Communication</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-blue-600">{stats.messages.templates}</div>
                <div className="text-gray-600 mt-2">Message Templates</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-green-600">{stats.messages.sent}</div>
                <div className="text-gray-600 mt-2">Messages Sent</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-purple-600">{stats.registrants.total}</div>
                <div className="text-gray-600 mt-2">Total Registrants</div>
              </div>
            </div>
          </section>
          
          {/* Recent Activity */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Recent Activity</h2>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all">
              {stats.recentActivity.length > 0 ? (
                <div className="divide-y">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <span className="font-medium">{activity.description}</span>
                        <span className="text-gray-500 text-sm">{formatDate(activity.date)}</span>
                      </div>
                      {activity.disposition && (
                        <div className="mt-1 text-sm text-gray-500">
                          Disposition: <span className="font-medium">{activity.disposition}</span>
                        </div>
                      )}
                      {activity.leadId && (
                        <div className="mt-1">
                          <Link href={`/admin/crm/lead/${activity.leadId}`} className="text-blue-600 text-sm hover:underline">
                            View Lead Details
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No recent activity</div>
              )}
            </div>
          </section>
          
          {/* Quick Links */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/crm" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:bg-blue-50">
                <h3 className="font-semibold text-lg text-blue-700">Lead Management</h3>
                <p className="text-gray-600 mt-2">Access and manage all leads, stages, and assignments</p>
              </Link>
              <Link href="/admin/tasks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:bg-blue-50">
                <h3 className="font-semibold text-lg text-blue-700">Task Management</h3>
                <p className="text-gray-600 mt-2">View, create, and manage tasks across the system</p>
              </Link>
              <Link href="/admin/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:bg-blue-50">
                <h3 className="font-semibold text-lg text-blue-700">System Settings</h3>
                <p className="text-gray-600 mt-2">Configure system options and customization settings</p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
