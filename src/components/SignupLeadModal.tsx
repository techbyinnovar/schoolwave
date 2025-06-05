import { useState, useEffect } from 'react';
import Modal from './Modal';

interface SignupLeadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isPageMode?: boolean;
}

export default function SignupLeadModal({ open, onClose, onSuccess, isPageMode }: SignupLeadModalProps) {
  const [form, setForm] = useState({
    schoolName: '',
    address: '',
    numStudents: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = typeof window !== 'undefined' && isPageMode ? require('next/navigation').useRouter() : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      let signupStageId = undefined;
      const settingRes = await fetch('/api/setting?key=signup_stage_id');
      const settingData = await settingRes.json();
      if (settingData.value) {
        signupStageId = settingData.value;
      } else {
        const stageRes = await fetch('/api/stage');
        const stageData = await stageRes.json();
        const signupStage = (stageData.stages || []).find((s: any) => s.name.toLowerCase() === 'signup');
        if (signupStage) signupStageId = signupStage.id;
      }
      if (!signupStageId) {
        setError('Signup stage not found.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName: form.schoolName,
          name: form.contactName,
          phone: form.contactPhone,
          email: form.contactEmail,
          address: form.address,
          numStudents: form.numStudents,
          stageId: signupStageId,
        }),
      });
      if (!res.ok) throw new Error('Failed to create lead.');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
        if (isPageMode && router) router.push('/welcome');
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    }
    setLoading(false);
  };

  if (isPageMode) {
    // Render as standalone page, not modal
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <h2 className="text-lg font-bold mb-2">Sign Up Your School</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Lead created successfully!</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
          <input required name="schoolName" value={form.schoolName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Name" />
          <input required name="address" value={form.address} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Address" />
          <input required name="numStudents" value={form.numStudents} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Number of Students" type="number" min="1" />
          <input required name="contactName" value={form.contactName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Name" />
          <input required name="contactPhone" value={form.contactPhone} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Phone" />
          <input required name="contactEmail" value={form.contactEmail} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Email" type="email" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">{loading ? 'Submitting...' : 'Sign Up'}</button>
        </form>
      </div>
    );
  }

  return (
    <Modal open={open} onClose={onClose} formComponent={
      <>
        <h2 className="text-lg font-bold mb-2">Sign Up Your School</h2>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">Lead created successfully!</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
          <input required name="schoolName" value={form.schoolName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Name" />
          <input required name="address" value={form.address} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="School Address" />
          <input required name="numStudents" value={form.numStudents} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Number of Students" type="number" min="1" />
          <input required name="contactName" value={form.contactName} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Name" />
          <input required name="contactPhone" value={form.contactPhone} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Phone" />
          <input required name="contactEmail" value={form.contactEmail} onChange={handleChange} className="border px-2 py-1 rounded" placeholder="Contact Email" type="email" />
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2">{loading ? 'Submitting...' : 'Sign Up'}</button>
        </form>
      </>
    } />
  );
}
