"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";

interface Customer {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  customerId: string;
  customer: Customer;
  startDate: string;
  termId: string;
  term?: Term;
  studentCount: number;
  terms: number; // number of terms for the main plan
  addons: AddonWithTerms[];
  createdAt: string;
  updatedAt: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface Term {
  id: string;
  name: string;
  academicYearId: string;
  academicYear?: AcademicYear;
}

interface AddonWithTerms extends Addon {
  terms: number;
}

interface Plan {
  id: string;
  name: string;
  pricePerStudentPerTerm: number;
}

interface Addon {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

function SubscriptionRow({ sub, loading, setLoading, setError }: any) {
  const [invoice, setInvoice] = React.useState<any | null>(null);
  const [checking, setChecking] = React.useState(true);
  React.useEffect(() => {
    setChecking(true);
    fetch(`/api/invoice/bySubscription/${sub.id}`)
      .then(res => res.json())
      .then(data => setInvoice(Array.isArray(data) && data.length > 0 ? data[0] : null))
      .catch(() => setInvoice(null))
      .finally(() => setChecking(false));
  }, [sub.id]);
  return (
    <tr>
      <td className="p-2 border">{sub.customer?.name}</td>
      <td className="p-2 border">{new Date(sub.startDate).toLocaleDateString()}</td>
      <td className="p-2 border">{sub.term?.name}{sub.term?.academicYear ? ` (${sub.term.academicYear.name})` : ''}</td>
      <td className="p-2 border">{sub.studentCount}</td>
      <td className="p-2 border">{new Date(sub.createdAt).toLocaleString()}</td>
      <td className="p-2 border">
        {checking ? (
          <span>...</span>
        ) : invoice ? (
          <a
            href={`/admin/invoice/${invoice.id}`}
            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            View Invoice
          </a>
        ) : (
          <button
            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            onClick={async () => {
              setLoading(true);
              setError(null);
              try {
                const res = await fetch(`/api/subscription/${sub.id}/generate-invoice`, { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to generate invoice');
                window.location.href = `/admin/invoice/${data.id}`;
              } catch (err: any) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Generate Invoice
          </button>
        )}
      </td>
    </tr>
  );
}

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [form, setForm] = useState<any>({ terms: 1, addonTerms: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
    fetchCustomers();
    fetchPlansAndAddons();
    fetchAcademicYearsAndTerms();
  }, []);

  async function fetchAcademicYearsAndTerms() {
    try {
      const yearsRes = await fetch('/api/setting?key=academic_years');
      const yearsData = await yearsRes.json();
      const years = Array.isArray(yearsData.value) ? yearsData.value : [];
      setAcademicYears(years);
      const termsRes = await fetch('/api/setting?key=terms');
      const termsData = await termsRes.json();
      let termsArray = Array.isArray(termsData.value) ? termsData.value : [];
      // Attach academicYear object to each term
      termsArray = termsArray.map((term: any) => ({
        ...term,
        academicYear: years.find((y: any) => y.id === term.academicYearId) || undefined
      }));
      setTerms(termsArray);
    } catch {}
  }

  async function fetchTerms() {
    try {
      const res = await fetch('/api/setting?key=terms');
      const data = await res.json();
      setTerms(Array.isArray(data.value) ? data.value : []);
    } catch {}
  }

  async function fetchPlansAndAddons() {
    try {
      const plansRes = await fetch('/api/setting?key=available_plans');
      const plansJson = await plansRes.json();
      setPlans(Array.isArray(plansJson.value) ? plansJson.value : []);
      const addonsRes = await fetch('/api/setting?key=available_addons');
      const addonsJson = await addonsRes.json();
      setAddons(Array.isArray(addonsJson.value) ? addonsJson.value : []);
    } catch {}
  }

  async function fetchSubscriptions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscription");
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customer");
      const data = await res.json();
      setCustomers(data);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Prepare addons array with terms for submission
      // Prepare payload for backend
      const termId = Array.isArray(form.termIds) && form.termIds.length > 0 ? form.termIds[0] : undefined;
      // Always resolve planObj from planName or planId
      let planObj: Plan | undefined = undefined;
      if (form.planName) {
        planObj = plans.find(p => p.name === form.planName);
      } else if (form.planId) {
        planObj = plans.find(p => p.id === form.planId);
      }
      const submission: any = {
        customerId: form.customerId,
        planId: planObj ? planObj.id : undefined,
        planName: planObj ? planObj.name : '',
        termId,
        terms: form.terms || 1,
        addonIds: form.addonIds || [],
        addonTerms: form.addonTerms || {},
        startDate: form.startDate,
        studentCount: form.studentCount,
        discountPercent: form.discountPercent
      };
      // Remove undefined fields
      Object.keys(submission).forEach(key => submission[key] === undefined && delete submission[key]);
      console.log('Submitting subscription payload:', submission);
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (!res.ok) throw new Error("Failed to create subscription");
      setForm({});
      fetchSubscriptions();
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error');
      }
      // Log the full error response for debugging
      if (err && err.response) {
        err.response.text().then((text: string) => {
          console.error('Full backend error response:', text);
        });
      } else {
        console.error('Submission error:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="border p-2 rounded"
          value={form.customerId || ""}
          onChange={e => setForm((f: any) => ({ ...f, customerId: e.target.value }))}
          required
        >
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="border p-2 rounded"
          value={form.planName || ""}
          onChange={e => setForm((f: any) => ({ ...f, planName: e.target.value }))}
          required
        >
          <option value="">Select Plan</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.name}>{plan.name} (₦{plan.pricePerStudentPerTerm})</option>
          ))}
        </select>
        <input
          className="border p-2 rounded"
          placeholder="Number of Terms"
          type="number"
          min="1"
          value={form.terms || 1}
          onChange={e => setForm((f: any) => ({ ...f, terms: parseInt(e.target.value) }))}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Discount (%)"
          type="number"
          min="0"
          max="100"
          value={form.discountPercent ?? ""}
          onChange={e => setForm((f: any) => ({ ...f, discountPercent: e.target.value ? Number(e.target.value) : undefined }))}
        />
        <input
          className="border p-2 rounded"
          placeholder="Start Date"
          type="date"
          value={form.startDate ? form.startDate.slice(0,10) : ""}
          onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
          required
        />
        {/* Term selection multi-select */}
        <Select
          isMulti
          options={terms.map(term => ({
             value: term.id,
             label: term.academicYear && term.academicYear.name ? `${term.name}-${term.academicYear.name}` : term.name
           }))}
          value={terms.filter(t => (form.termIds || []).includes(t.id)).map(t => ({
             value: t.id,
             label: t.academicYear && t.academicYear.name ? `${t.name}-${t.academicYear.name}` : t.name
           }))}
          onChange={selected => {
            setForm((f: any) => ({
              ...f,
              termIds: selected.map((s: any) => s.value)
            }));
          }}
          placeholder="Select Term(s)"
          classNamePrefix="react-select"
        />
        <input
          className="border p-2 rounded"
          placeholder="Student Count"
          type="number"
          value={form.studentCount || ""}
          onChange={e => setForm((f: any) => ({ ...f, studentCount: parseInt(e.target.value) }))}
          required
        />
        <div className="col-span-1 md:col-span-3">
          <Select
            isMulti
            options={addons.map(addon => ({ value: addon.id, label: addon.name + (addon.price ? ` (₦${addon.price})` : '') }))}
            value={addons.filter(a => (form.addonIds || []).includes(a.id)).map(a => ({ value: a.id, label: a.name + (a.price ? ` (₦${a.price})` : '') }))}
            onChange={selected => {
              setForm((f: any) => {
                // preserve previous terms for already-selected addons
                const prevTerms = f.addonTerms || {};
                const selectedIds = selected.map((s: any) => s.value);
                // Remove terms for unselected addons
                const newAddonTerms: Record<string, number> = {};
                selectedIds.forEach((id: string) => {
                  newAddonTerms[id] = prevTerms[id] || 1;
                });
                return { ...f, addonIds: selectedIds, addonTerms: newAddonTerms };
              });
            }}
            placeholder="Select Addons"
            classNamePrefix="react-select"
          />
          {/* Render number of terms for each selected addon */}
          {Array.isArray(form.addonIds) && form.addonIds.length > 0 && (
            <div className="mt-2 space-y-2">
              {form.addonIds.map((id: string) => {
                const addon = addons.find(a => a.id === id);
                return (
                  <div key={id} className="flex items-center gap-2">
                    <span className="min-w-[120px]">{addon?.name}</span>
                    <input
                      type="number"
                      min={1}
                      className="border p-1 rounded w-24"
                      value={form.addonTerms?.[id] || 1}
                      onChange={e => setForm((f: any) => ({
                        ...f,
                        addonTerms: { ...f.addonTerms, [id]: parseInt(e.target.value) }
                      }))}
                      placeholder="Terms"
                    />
                    <span className="text-xs text-gray-400">terms</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="col-span-1 md:col-span-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Add Subscription"}
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Start Date</th>
              <th className="p-2 border">End Date</th>
              <th className="p-2 border">Student Count</th>
              <th className="p-2 border">Created</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} sub={sub} loading={loading} setLoading={setLoading} setError={setError} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
