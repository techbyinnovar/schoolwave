"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Select from 'react-select';

// Simplified interfaces to match the actual data model
interface Customer {
  id: string;
  name: string;
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

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [subscription, setSubscription] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch subscription and settings data
        const [subRes, custRes, plansRes, addonsRes] = await Promise.all([
          fetch(`/api/subscription/${id}`),
          fetch('/api/customer'),
          fetch('/api/setting?key=available_plans'),
          fetch('/api/setting?key=available_addons'),
        ]);

        if (!subRes.ok) throw new Error('Failed to fetch subscription details.');

        const subData = await subRes.json();
        const custData = await custRes.json();
        const plansData = await plansRes.json();
        const addonsData = await addonsRes.json();

        // Parse the 'addons' JSON from the subscription data to populate the form state
        const subAddons = Array.isArray(subData.addons) ? subData.addons : [];
        const addonIds = subAddons.map((a: any) => a.addonId);
        const addonTerms = subAddons.reduce((acc: any, cur: any) => {
            acc[cur.addonId] = cur.terms;
            return acc;
        }, {});

        setSubscription({ ...subData, addonIds, addonTerms });
        setCustomers(custData || []);
        setPlans(Array.isArray(plansData.value) ? plansData.value : []);
        setAddons(Array.isArray(addonsData.value) ? addonsData.value : []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setSubscription((prev: any) => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/subscription/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update subscription.');
      }

      router.push('/admin/subscription');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !subscription) return <p>Loading subscription details...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!subscription) return <p>No subscription found.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Subscription</h1>
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div>
            <label>Customer</label>
            <Select
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                value={customers.map(c => ({ value: c.id, label: c.name })).find(c => c.value === subscription.customerId)}
                isDisabled
            />
        </div>

        <div>
            <label>Plan</label>
            <Select
                options={plans.map(p => ({ value: p.name, label: p.name }))}
                value={plans.map(p => ({ value: p.name, label: p.name })).find(p => p.value === subscription.planName)}
                onChange={selected => setSubscription((prev: any) => ({ ...prev, planName: selected?.value }))}
            />
        </div>

        <div>
            <label>Start Date</label>
            <input
                type="date"
                name="startDate"
                value={subscription.startDate ? new Date(subscription.startDate).toISOString().slice(0, 10) : ''}
                onChange={handleFormChange}
                className="border p-2 rounded w-full"
            />
        </div>

        <div>
            <label>Student Count</label>
            <input
                type="number"
                name="studentCount"
                value={subscription.studentCount || ''}
                onChange={handleFormChange}
                className="border p-2 rounded w-full"
            />
        </div>

        <div>
            <label>Terms</label>
            <input
                type="number"
                name="terms"
                value={subscription.terms || 1}
                onChange={handleFormChange}
                className="border p-2 rounded w-full"
            />
        </div>

        <div>
            <label>Discount (%)</label>
            <input
                type="number"
                name="discountPercent"
                value={subscription.discountPercent ?? ''}
                onChange={handleFormChange}
                className="border p-2 rounded w-full"
            />
        </div>

        <div className="col-span-1 md:col-span-2">
          <label>Addons</label>
          <Select
            isMulti
            options={addons.map(addon => ({ value: addon.id, label: addon.name }))}
            value={addons.filter(a => (subscription.addonIds || []).includes(a.id)).map(a => ({ value: a.id, label: a.name }))}
            onChange={selected => {
                const selectedIds = selected.map((s: any) => s.value);
                const newAddonTerms = { ...subscription.addonTerms };
                selectedIds.forEach(id => {
                    if (!newAddonTerms[id]) newAddonTerms[id] = 1;
                });
                Object.keys(newAddonTerms).forEach(id => {
                    if (!selectedIds.includes(id)) delete newAddonTerms[id];
                });
                setSubscription((prev: any) => ({ ...prev, addonIds: selectedIds, addonTerms: newAddonTerms }));
            }}
          />
        </div>

        {(subscription.addonIds || []).map((addonId: string) => (
            <div key={addonId}>
                <label>{addons.find(a => a.id === addonId)?.name} - Terms</label>
                <input
                    type="number"
                    value={subscription.addonTerms[addonId] || 1}
                    onChange={e => {
                        const newAddonTerms = { ...subscription.addonTerms, [addonId]: Number(e.target.value) };
                        setSubscription((prev: any) => ({ ...prev, addonTerms: newAddonTerms }));
                    }}
                    className="border p-2 rounded w-full"
                />
            </div>
        ))}

        <div className="col-span-1 md:col-span-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
