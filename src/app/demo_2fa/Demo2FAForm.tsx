"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DEMO_CODE_STORAGE_KEY = 'demo_code';

export default function Demo2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/demo'); // Default redirect

  useEffect(() => {
    const storedRedirect = searchParams.get('redirect_url');
    if (storedRedirect) {
      setRedirectUrl(decodeURIComponent(storedRedirect));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a demo code.');
      return;
    }
    localStorage.setItem(DEMO_CODE_STORAGE_KEY, code);
    setError('');
    router.push(redirectUrl);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        Demo Access Required
      </h1>
      <p className="text-center text-sm text-gray-600 dark:text-gray-300">
        Please enter your demo access code to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="demo-code" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Demo Code
          </label>
          <input
            id="demo-code"
            name="demo-code"
            type="text"
            autoComplete="off"
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            Submit Code
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
        Don&apos;t have a code?{' '}
        <Link href="/get_demo_code" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Click here to get your code
        </Link>
      </p>
    </div>
  );
}
