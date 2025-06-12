"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FormData {
  name: string;
  phone: string;
  email: string;
  schoolName: string;
  numberOfStudents: string;
  howHeard: string;
}

const howHeardOptions = [
  "Social Media (e.g., Facebook, Instagram, LinkedIn)",
  "Referral (Colleague, Friend)",
  "Search Engine (e.g., Google)",
  "Online Advertisement",
  "Educational Event/Conference",
  "Schoolwave Website/Blog",
  "Other",
];

const studentNumberOptions = [
  "1-50 students",
  "51-100 students",
  "101-200 students",
  "201-500 students",
  "501-1000 students",
  "1000+ students",
  "Not Sure / Just Exploring"
];

export default function GetDemoCodePage() {
  const router = useRouter();
  // Redirect if demo_code and leadId are present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const demoCode = localStorage.getItem('demo_code');
      const leadId = localStorage.getItem('leadId');
      if (demoCode && leadId) {
        router.replace('/demo');
      }
    }
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    schoolName: '',
    numberOfStudents: '',
    howHeard: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiErrors, setApiErrors] = useState<Record<string, string[] | undefined> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatedDemoCode, setGeneratedDemoCode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (apiErrors && apiErrors[name]) {
        setApiErrors(prev => ({...prev, [name]: undefined})); // Clear specific API error on change
    }
    if (error) setError(null); // Clear general error on change
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setApiErrors(null);
    setSuccessMessage(null);
    setGeneratedDemoCode(null);

    // Basic client-side validation for empty fields
    for (const key in formData) {
      if (formData[key as keyof FormData].trim() === '') {
        const fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase(); // e.g. schoolName -> school name
        setError(`Please fill in all fields. The '${fieldName}' field is missing.`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'An error occurred while submitting the form.');
        if (result.errors) {
            setApiErrors(result.errors);
        }
        // If email already exists and API returns the existing demo code (status 409)
        if (response.status === 409 && result.demoCode) { 
            setSuccessMessage(result.message); // Show message like "A lead with this email already exists..."
            setGeneratedDemoCode(result.demoCode);
            localStorage.setItem('demo_code', result.demoCode);
            if (result.leadId) {
              localStorage.setItem('leadId', result.leadId);
            }
            setError(null); // Clear general error as it's a specific case
        }
        setIsLoading(false);
        return;
      }

      setSuccessMessage(result.message || 'Demo code generated successfully!');
      setGeneratedDemoCode(result.demoCode);
      localStorage.setItem('demo_code', result.demoCode); // Store demo code for access
      if (result.leadId) {
        localStorage.setItem('leadId', result.leadId);
      }
      
      // Clear form on success
      setFormData({ name: '', phone: '', email: '', schoolName: '', numberOfStudents: '', howHeard: '' });

    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred during submission. Please check your connection and try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <div className='bg-[#00164E] dark:bg-gray-900 sticky top-0 z-50 shadow-md'>
        <Header />
      </div>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              🎥 Watch Our Demo Video Now
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Fill out the form below to get instant access!

            </p>
          </div>

          {generatedDemoCode && successMessage ? (
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <h2 className="text-2xl font-semibold text-green-700 dark:text-green-300">Success!</h2>
              <p className="mt-2 text-gray-700 dark:text-gray-200">{successMessage}</p>
              <p className="mt-4 text-lg font-medium text-gray-800 dark:text-white">
                Your Demo Code: 
                <strong className="ml-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 rounded-md tracking-wider">{generatedDemoCode}</strong>
              </p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                This code has been saved to your browser. You can now access our demo pages.
              </p>
              <Link href="/demo" 
                className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-150 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800">
                Explore Demos Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required 
                       className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                {apiErrors?.name && <p className="text-xs text-red-500 mt-1">{apiErrors.name.join(', ')}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number (WhatsApp preferred) <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required 
                       className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                {apiErrors?.phone && <p className="text-xs text-red-500 mt-1">{apiErrors.phone.join(', ')}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required 
                       className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                {apiErrors?.email && <p className="text-xs text-red-500 mt-1">{apiErrors.email.join(', ')}</p>}
              </div>

              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School Name <span className="text-red-500">*</span></label>
                <input type="text" name="schoolName" id="schoolName" value={formData.schoolName} onChange={handleChange} required 
                       className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                {apiErrors?.schoolName && <p className="text-xs text-red-500 mt-1">{apiErrors.schoolName.join(', ')}</p>}
              </div>

              <div>
                <label htmlFor="numberOfStudents" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Students (Estimate) <span className="text-red-500">*</span></label>
                <select name="numberOfStudents" id="numberOfStudents" value={formData.numberOfStudents} onChange={handleChange} required 
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="" disabled>Select an option</option>
                  {studentNumberOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {apiErrors?.numberOfStudents && <p className="text-xs text-red-500 mt-1">{apiErrors.numberOfStudents.join(', ')}</p>}
              </div>

              <div>
                <label htmlFor="howHeard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How did you hear about Schoolwave? <span className="text-red-500">*</span></label>
                <select name="howHeard" id="howHeard" value={formData.howHeard} onChange={handleChange} required 
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="" disabled>Select an option</option>
                  {howHeardOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {apiErrors?.howHeard && <p className="text-xs text-red-500 mt-1">{apiErrors.howHeard.join(', ')}</p>}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <button type="submit" disabled={isLoading} 
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors duration-150">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
