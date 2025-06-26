"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/AdminSidebar";
import AcademicSettings from "@/components/AcademicSettings";

interface Stage {
  id: string;
  name: string;
  defaultTemplateId?: string | null;
  defaultTemplate?: { id: string; name: string } | null;
}

interface Action {
  id: string;
  name: string;
}

// String array for dispositions (no longer using id-based model)
type Disposition = string;

interface MessageTemplate {
  id: string;
  name: string;
}

interface Addon {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

interface Plan {
  id: string;
  name: string;
  pricePerStudentPerTerm: number;
}

export default function AdminSettingsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planForm, setPlanForm] = useState<Partial<Plan>>({});
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState<Partial<Action>>({});
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [dispositionForm, setDispositionForm] = useState<string>("");
  const [editingDisposition, setEditingDisposition] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [signupStageId, setSignupStageId] = useState<string>("");
  const [contactStageId, setContactStageId] = useState<string>("");
  const [demoStageId, setDemoStageId] = useState<string>("");
  const [webinarStageId, setWebinarStageId] = useState<string>("");
  const [watchedDemoStageId, setWatchedDemoStageId] = useState<string>("");
  const [actions, setActions] = useState<Action[]>([]);
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [addonForm, setAddonForm] = useState<Partial<Addon>>({});
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'addons' | 'stages' | 'actions' | 'dispositions' | 'defaults' | 'plans' | 'stageTemplates'>("academic");
  const [stageTemplateMap, setStageTemplateMap] = useState<Record<string, string>>(/* stageId: templateId */{});
  const [savingStageTemplates, setSavingStageTemplates] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch plans from settings
      const plansRes = await fetch('/api/setting?key=available_plans');
      const plansJson = await plansRes.json();
      setPlans(Array.isArray(plansJson.value) ? plansJson.value : []);
      const stagesRes = await fetch("/api/stage");
      const stagesJson = await stagesRes.json();
      setStages(stagesJson.result?.data || []);

      // Update the stageTemplateMap with the latest from backend
      const fetchedStages = stagesJson.result?.data || [];
      const newStageMap: Record<string, string> = {};
      fetchedStages.forEach((stage: any) => {
        if (stage.defaultTemplateId) newStageMap[stage.id] = stage.defaultTemplateId;
      });
      setStageTemplateMap(newStageMap);

      const templatesRes = await fetch("/api/message-template");
      const templatesJson = await templatesRes.json();
      setTemplates(templatesJson.result?.data || []);

      const [signupRes, contactRes, demoRes, webinarRes, watchedDemoRes] = await Promise.all([
        fetch("/api/setting?key=signup_stage_id"),
        fetch("/api/setting?key=contact_stage_id"),
        fetch("/api/setting?key=demo_stage_id"),
        fetch("/api/setting?key=webinar_stage_id"),
        fetch("/api/setting?key=watched_demo_stage_id"),
      ]);
      setSignupStageId((await signupRes.json()).value || "");
      setContactStageId((await contactRes.json()).value || "");
      setDemoStageId((await demoRes.json()).value || "");
      setWebinarStageId((await webinarRes.json()).value || "");
      setWatchedDemoStageId((await watchedDemoRes.json()).value || "");

      const actionsRes = await fetch("/api/action");
      const actionsJson = await actionsRes.json();
      setActions(actionsJson.result?.data || []);
      
          // Fetch dispositions from our Settings-based API
      try {
        const dispositionsRes = await fetch("/api/disposition");
        const dispositionsJson = await dispositionsRes.json();
        setDispositions(dispositionsJson.result?.data || []);
      } catch (error) {
        console.error("Error fetching dispositions:", error);
        setDispositions([]);
      }

      const addonsRes = await fetch('/api/setting?key=available_addons');
      const addonsJson = await addonsRes.json();
      setAvailableAddons(Array.isArray(addonsJson.value) ? addonsJson.value : []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch settings or stages." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "signup_stage_id", value: signupStageId }),
        }),
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "contact_stage_id", value: contactStageId }),
        }),
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "demo_stage_id", value: demoStageId }),
        }),
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "webinar_stage_id", value: webinarStageId }),
        }),
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "watched_demo_stage_id", value: watchedDemoStageId }),
        }),
        fetch("/api/setting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "available_addons", value: availableAddons }),
        }),
        // Save dispositions as a setting (fallback until dedicated API is fully implemented)
        // Dispositions are now managed via the API
        // No need to manually save to settings
      ]);
      Swal.fire({ icon: "success", title: "Settings Saved" });
      fetchData();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

          <div className="flex border-b mb-8 overflow-x-auto">
            {['academic', 'addons', 'stages', 'actions', 'dispositions', 'plans', 'defaults', 'stageTemplates'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors duration-200 ${
                  activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab === 'stageTemplates' ? 'Stage Templates' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "academic" && (
            <div className="w-full">
              <AcademicSettings />
            </div>
          )}
          {activeTab === "addons" && (
            <div>
              <h2 className="font-bold text-lg mb-2">Manage Addons</h2>
              <form
                className="flex flex-col gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!addonForm.name) return;

                  let newAddons = [...availableAddons];
                  if (editingAddonId) {
                    newAddons = newAddons.map((a) =>
                      a.id === editingAddonId ? { ...a, ...addonForm } as Addon : a
                    );
                  } else {
                    newAddons.push({
                      id: crypto.randomUUID(),
                      name: addonForm.name,
                      description: addonForm.description || "",
                      price: addonForm.price ? Number(addonForm.price) : 0,
                    });
                  }

                  setAvailableAddons(newAddons);
                  setAddonForm({});
                  setEditingAddonId(null);

                  await fetch("/api/setting", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: "available_addons", value: newAddons }),
                  });
                  fetchData();
                }}
              >
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Addon Name"
                  value={addonForm.name || ""}
                  onChange={(e) => setAddonForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  className="border rounded px-3 py-2"
                  placeholder="Description"
                  value={addonForm.description || ""}
                  onChange={(e) => setAddonForm((f) => ({ ...f, description: e.target.value }))}
                />
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  placeholder="Price"
                  value={addonForm.price ?? ""}
                  onChange={(e) => setAddonForm((f) => ({ ...f, price: Number(e.target.value) }))}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingAddonId ? "Update" : "Add"}
                </button>
              </form>

              <ul>
                {availableAddons.map((addon) => (
                  <li key={addon.id} className="border p-2 rounded mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{addon.name}</p>
                      {addon.description && <p className="text-sm text-gray-500">{addon.description}</p>}
                      {addon.price !== undefined && <p className="text-sm text-gray-700">₦{addon.price}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingAddonId(addon.id);
                          setAddonForm(addon);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            title: "Are you sure?",
                            text: "This will remove the addon.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (confirmed.isConfirmed) {
                            const newAddons = availableAddons.filter((a) => a.id !== addon.id);
                            setAvailableAddons(newAddons);
                            await fetch("/api/setting", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ key: "available_addons", value: newAddons }),
                            });
                          }
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "plans" && (
            <div>
              <h2 className="font-bold text-lg mb-2">Manage Plans</h2>
              <form
                className="flex gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!planForm.name || !planForm.pricePerStudentPerTerm) return;
                  let newPlans;
                  if (editingPlanId) {
                    newPlans = plans.map(p => p.id === editingPlanId ? { ...p, name: planForm.name!, pricePerStudentPerTerm: planForm.pricePerStudentPerTerm! } : p);
                  } else {
                    newPlans = [
                      ...plans,
                      { id: crypto.randomUUID(), name: planForm.name!, pricePerStudentPerTerm: planForm.pricePerStudentPerTerm! }
                    ];
                  }
                  const res = await fetch('/api/setting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'available_plans', value: newPlans }),
                  });
                  if (res.ok) {
                    fetchData();
                    setPlanForm({});
                    setEditingPlanId(null);
                  } else {
                    Swal.fire({ icon: 'error', title: 'Failed to save plan' });
                  }
                }}
              >
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Plan Name"
                  value={planForm.name || ""}
                  onChange={(e) => setPlanForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-48"
                  placeholder="Price per student/term"
                  value={planForm.pricePerStudentPerTerm ?? ""}
                  min="0"
                  step="any"
                  onChange={(e) => setPlanForm(f => ({ ...f, pricePerStudentPerTerm: Number(e.target.value) }))}
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingPlanId ? "Update" : "Add"}
                </button>
                {editingPlanId && (
                  <button
                    type="button"
                    onClick={() => { setEditingPlanId(null); setPlanForm({}); }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >Cancel</button>
                )}
              </form>
              <ul className="divide-y">
                {plans.map((plan) => (
                  <li key={plan.id} className="flex items-center justify-between py-2">
                    <div>
                      <span className="font-medium">{plan.name}</span>
                      <span className="ml-4 text-gray-700">₦{plan.pricePerStudentPerTerm} / student / term</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => {
                          setEditingPlanId(plan.id);
                          setPlanForm({ name: plan.name, pricePerStudentPerTerm: plan.pricePerStudentPerTerm });
                        }}
                      >Edit</button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            title: "Are you sure?",
                            text: "This will delete the plan.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (confirmed.isConfirmed) {
                            const newPlans = plans.filter(p => p.id !== plan.id);
                            await fetch('/api/setting', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key: 'available_plans', value: newPlans }),
                            });
                            fetchData();
                          }
                        }}
                      >Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "defaults" && (
            <div className="space-y-4">
              <div>
                <label>Signup Stage</label>
                <select className="w-full border rounded px-2 py-1" value={signupStageId} onChange={e => setSignupStageId(e.target.value)}>
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Contact Stage</label>
                <select className="w-full border rounded px-2 py-1" value={contactStageId} onChange={e => setContactStageId(e.target.value)}>
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Demo Stage</label>
                <select className="w-full border rounded px-2 py-1" value={demoStageId} onChange={e => setDemoStageId(e.target.value)}>
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Webinar Stage</label>
                <select className="w-full border rounded px-2 py-1" value={webinarStageId} onChange={e => setWebinarStageId(e.target.value)}>
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Watched Demo Stage</label>
                <select className="w-full border rounded px-2 py-1" value={watchedDemoStageId} onChange={e => setWatchedDemoStageId(e.target.value)}>
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          )}

          {activeTab === "stages" && (
            <div>
              <h2 className="font-bold text-lg mb-2">Manage Stages</h2>
              <form
                className="flex gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem('stageName') as HTMLInputElement).value.trim();
                  if (!name) return;
                  const res = await fetch("/api/stage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  if (res.ok) {
                    fetchData();
                    form.reset();
                  } else {
                    Swal.fire({ icon: "error", title: "Failed to create stage" });
                  }
                }}
              >
                <input
                  name="stageName"
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="New stage name"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add Stage
                </button>
              </form>
              <ul className="divide-y">
                {stages.map((stage) => (
                  <li key={stage.id} className="py-2 flex items-center justify-between">
                    <span>{stage.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "stageTemplates" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-2">Set Default Template for Each Stage</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSavingStageTemplates(true);
                  try {
                    await Promise.all(
                      stages.map(stage => {
                        const selectedTemplateId = stageTemplateMap[stage.id];
                        if (!selectedTemplateId || stage.defaultTemplateId === selectedTemplateId) return null;
                        return fetch(`/api/stage`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: stage.id, defaultTemplateId: selectedTemplateId }),
                        });
                      })
                    );
                    Swal.fire({ icon: "success", title: "Templates updated" });
                    fetchData();
                  } catch (err) {
                    Swal.fire({ icon: "error", title: "Failed to update templates" });
                  } finally {
                    setSavingStageTemplates(false);
                  }
                }}
              >
                <table className="min-w-full border rounded">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Stage</th>
                      <th className="p-2 text-left">Default Template</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map(stage => (
                      <tr key={stage.id} className="border-t">
                        <td className="p-2">{stage.name}</td>
                        <td className="p-2">
                          <select
                            className="border rounded px-2 py-1"
                            value={stageTemplateMap[stage.id] ?? stage.defaultTemplateId ?? ''}
                            onChange={e => setStageTemplateMap(map => ({ ...map, [stage.id]: e.target.value }))}
                          >
                            <option value="">-- No Default --</option>
                            {templates.map(tmpl => (
                              <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={savingStageTemplates}
                >
                  {savingStageTemplates ? "Saving..." : "Save Templates"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "actions" && (
            <div>
              <h2 className="font-bold text-lg mb-2">Manage Actions</h2>
              <form
                className="flex gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!actionForm.name) return;
                  let method = editingActionId ? "PATCH" : "POST";
                  let url = "/api/action";
                  let body = editingActionId
                    ? { id: editingActionId, name: actionForm.name }
                    : { name: actionForm.name };
                  const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });
                  if (res.ok) {
                    fetchData();
                    setActionForm({});
                    setEditingActionId(null);
                  } else {
                    Swal.fire({ icon: "error", title: "Failed to save action" });
                  }
                }}
              >
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Action Name"
                  value={actionForm.name || ""}
                  onChange={(e) => setActionForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingActionId ? "Update" : "Add"}
                </button>
                {editingActionId && (
                  <button
                    type="button"
                    onClick={() => { setEditingActionId(null); setActionForm({}); }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >Cancel</button>
                )}
              </form>
              <ul className="divide-y">
                {actions.map((action) => (
                  <li key={action.id} className="flex items-center justify-between py-2">
                    <span>{action.name}</span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => {
                          setEditingActionId(action.id);
                          setActionForm({ name: action.name });
                        }}
                      >Edit</button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            title: "Are you sure?",
                            text: "This will delete the action.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (confirmed.isConfirmed) {
                            await fetch("/api/action", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: action.id }),
                            });
                            fetchData();
                          }
                        }}
                      >Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === "dispositions" && (
            <div>
              <h2 className="font-bold text-lg mb-2">Manage Dispositions</h2>
              <p className="text-sm text-gray-600 mb-4">Dispositions track the outcome of each logged lead action.</p>
              <form
                className="flex gap-2 mb-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!dispositionForm) return;
                  
                  // Add or update disposition
                  try {
                    if (editingDisposition) {
                      // Update case - since we can't update names in our string-based approach,
                      // we need to delete the old one and add the new one
                      await fetch("/api/disposition", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: editingDisposition }),
                      });
                    }
                    
                    // Add the disposition
                    await fetch("/api/disposition", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: dispositionForm }),
                    });
                    
                    // Reset form and refresh data
                    fetchData();
                    setDispositionForm("");
                    setEditingDisposition(null);
                  } catch (error) {
                    console.error("Error saving disposition:", error);
                    Swal.fire({ icon: "error", title: "Error", text: "Failed to save disposition." });
                  }
                }}
              >
                <input
                  className="border rounded px-3 py-2 flex-1"
                  placeholder="Disposition Name"
                  value={dispositionForm}
                  onChange={(e) => setDispositionForm(e.target.value)}
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingDisposition ? "Update" : "Add"}
                </button>
                {editingDisposition && (
                  <button
                    type="button"
                    onClick={() => { setEditingDisposition(null); setDispositionForm(""); }}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >Cancel</button>
                )}
              </form>
              <ul className="divide-y">
                {dispositions.map((disposition, index) => (
                  <li key={index} className="flex items-center justify-between py-2">
                    <span>{disposition}</span>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => {
                          setEditingDisposition(disposition);
                          setDispositionForm(disposition);
                        }}
                      >Edit</button>
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            title: "Are you sure?",
                            text: "This will delete the disposition.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Yes, delete it!",
                          });
                          if (confirmed.isConfirmed) {
                            try {
                              await fetch("/api/disposition", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: disposition }),
                              });
                              fetchData();
                            } catch (error) {
                              console.error("Error deleting disposition:", error);
                              Swal.fire({ icon: "error", title: "Error", text: "Failed to delete disposition." });
                            }
                          }
                        }}
                      >Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
